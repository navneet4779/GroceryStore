import UserModel from '../models/userModel.js'
import bcryptjs from 'bcryptjs'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
export async function registerUserController(request,response){
    
    try {
        const { name, email , password } = request.body
        if(!name || !email || !password){
            return response.status(400).json({
                message : "provide email, name, password",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(user){
            return response.json({
                message : "Already register email",
                error : true,
                success : false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password,salt)

        const payload = {
            name,
            email,
            password : hashPassword
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        //const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`

        /*const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "Verify email from binkeyit",
            html : verifyEmailTemplate({
                name,
                url : VerifyEmailUrl
            })
        })*/

        return response.json({
            message : "User register successfully",
            error : false,
            success : true,
            data : save
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
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