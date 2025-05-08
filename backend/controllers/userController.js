import UserModel from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import sendEmail from '../config/sendEmail.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'

export async function registerUserController(request, response) {
    try {
        const { name, email, password } = request.body;

        // Validate input fields
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "Please provide name, email, and password",
                error: true,
                success: false,
            });
        }

        // Check if the user already exists
        const user = await UserModel.findOne({
            where: { email }, // Use Sequelize's `where` clause
        });

        if (user) {
            return response.status(400).json({
                message: "Email is already registered",
                error: true,
                success: false,
            });
        }

        // Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // Create the user payload
        const payload = {
            name,
            email,
            password: hashPassword,
        };

        // Save the new user to the database
        const newUser = await UserModel.create(payload);

        return response.status(201).json({
            message: "User registered successfully",
            error: false,
            success: true,
            data: newUser,
        });
    } catch (error) {
        console.error("Error in registerUserController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
}


export async function loginController(request, response) {
    try {
        const { email, password } = request.body;

        // Validate input
        if (!email || !password) {
            return response.status(400).json({
                message: "Provide email and password",
                error: true,
                success: false,
            });
        }

        // Find the user by email
        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return response.status(400).json({
                message: "User not registered",
                error: true,
                success: false,
            });
        }

        // Check if the user is active
        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact the Admin",
                error: true,
                success: false,
            });
        }

        // Compare the provided password with the hashed password in the database
        const checkPassword = await bcryptjs.compare(password, user.password);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Incorrect password",
                error: true,
                success: false,
            });
        }

        // Generate access and refresh tokens
        const accessToken = await generatedAccessToken(user.id); // Use `id` for MySQL
        const refreshToken = await genertedRefreshToken(user.id); // Use `id` for MySQL

        // Update the user's last login date
        await UserModel.update(
            { last_login_date: new Date() },
            { where: { id: user.id } }
        );

        // Set cookies for the tokens
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };
        response.cookie("accessToken", accessToken, cookiesOption);
        response.cookie("refreshToken", refreshToken, cookiesOption);

        // Return success response
        return response.json({
            message: "Login successful",
            error: false,
            success: true,
            token: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        // Handle errors
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}



export async function userDetails(request, response) {
    try {
        const userId = request.userId; // Extract user ID from the request (e.g., from middleware)

        // Fetch the user details from the database
        const user = await UserModel.findOne({
            where: { id: userId }, // Find the user by ID
            attributes: { exclude: ['password', 'refresh_token'] }, // Exclude sensitive fields
        });

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        return response.json({
            message: "User details",
            data: user,
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        return response.status(500).json({
            message: "Something went wrong",
            error: true,
            success: false,
        });
    }
}


export async function logoutController(request,response){
    try {
        const userId = request.userId //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        // Update the user's refresh token to an empty string in the database
        await UserModel.update(
            { refresh_token: "" }, // Set refresh_token to an empty string
            { where: { id: userId } } // Find the user by ID
        );

        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function updateUserDetails(request,response){
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body 

        let hashPassword = ""

        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password,salt)
        }

        const updateFields = {
            ...(name && { name }),
            ...(email && { email }),
            ...(mobile && { mobile }),
            ...(password && { password: hashPassword }),
        };

        const updateUser = await UserModel.update(updateFields, {
            where: { id: userId },
        });

        if (updateUser[0] === 0) {
            return response.status(404).json({
                message: "User not found or no changes made",
                error: true,
                success: false,
            });
        }

        return response.json({
            message : "Updated successfully",
            error : false,
            success : true,
            data : updateUser
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body;

        // Check if the email is provided
        if (!email) {
            return response.status(400).json({
                message: "Please provide an email address",
                error: true,
                success: false,
            });
        }

        // Find the user by email
        const user = await UserModel.findOne({
            where: { email },
        });

        if (!user) {
            return response.status(400).json({
                message: "Email not registered",
                error: true,
                success: false,
            });
        }

        // Generate OTP and expiry time
        const otp = Math.floor(Math.random() * 900000) + 100000;
        const expireTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Update the user's forgot password OTP and expiry in the database
        await UserModel.update(
            {
                forgot_password_otp: otp,
                forgot_password_expiry: expireTime,
            },
            {
                where: { id: user.id },
            }
        );

        // Send the OTP to the user's email
        await sendEmail({
            sendTo: email,
            subject: "Forgot Password - Grocery Store",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp,
            }),
        });

        return response.json({
            message: "Check your email for the OTP",
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in forgotPasswordController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
}


export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({
            where: { email },
        });

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.update(
            {
                forgot_password_otp: "", // Clear the OTP
                forgot_password_expiry: "", // Clear the expiry
            },
            {
                where: { id: user.id }, // Use the user's ID to find the record
            }
        );
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({
            where: { email },
        });

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await UserModel.update(
            {
                password: hashPassword, // Update the password
            },
            {
                where: { id: user.id }, // Use the user's ID to find the record
            }
        );

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}