import UserModel from '../models/userModel.js'
import CartProduct  from "../models/cartproductModel.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import generatedRefreshToken from '../utils/generatedRefreshToken.js'
import sendEmail from '../config/sendEmail.js'
import loginOtpTemplate from '../utils/loginOtpTemplate.js'

const cookiesOption = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
};

export async function sendOtpController(request, response) {    
    try {
        const { email } = request.body;

        // Validate email
        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false,
            });
        }

        // Find user by email
        let user = await UserModel.findOne({ where: { email } });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        // Send OTP via email
        await sendEmail({
            sendTo: email,
            subject: "Your OTP Code",
            html: loginOtpTemplate({ otp }),
        });

        // If user exists, update OTP and expiry
        if (user) {
            user.login_otp = otp;
            user.login_otp_expiry = otpExpiry;
            await user.save();
        } else {
            // If user does not exist, create a new user with OTP
            user = await UserModel.create({
                email,
                login_otp: otp,
                login_otp_expiry: otpExpiry,
                status: "Pending",
            });
        }

        return response.status(200).json({
            message: "OTP sent successfully",
            error: false,
            success: true,
        });
    } catch (error) {
        console.error("Error in sendOtpController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
}


export async function verifyOtpController(request, response) {
    try{
        const { email, otp } = request.body;

        // Validate input
        if (!email || !otp) {
            return response.status(400).json({
                message: "Provide email and OTP",
                error: true,
                success: false,
            });
        }

        // Find user by email
        const user = await UserModel.findOne({ where: { email } });

        if (!user) {
            return response.status(400).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        const currentTime = new Date().toISOString()

        if(user.login_otp_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        // Check if OTP is valid
        if (user.login_otp !== otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false,
            });
        }

        // OTP is valid, proceed with login
        user.login_otp = null; // Clear login OTP
        user.login_otp_expiry = null; // Clear login OTP expiry
        user.last_login_date = new Date(); // Update last login date
        user.status = "Active"; // Set user status to Active
        await user.save();

        const accessToken =  generatedAccessToken(user.id); // Use `id` for MySQL
        const refreshToken = generatedRefreshToken(user.id); // Use `id` for MySQL

        CartProduct.update(
            { userId: user.id }, // Set the userId for the cart items
            { where: { userId: null } } // Clear the user's cart
        );

        response.cookie("accessToken", accessToken, cookiesOption);
        response.cookie("refreshToken", refreshToken, cookiesOption);

        return response.json({
            message: "Login successful",
            error: false,
            success: true,
            userID: user.id, // Use `id` for MySQL
            token: {
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Error in verifyOtpController:", error.message);
        return response.status(500).json({
            message: error.message || "Internal Server Error",
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

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        // Update the user's refresh token to an empty string in the database
        await UserModel.update(
            { refresh_token: "" }, // Set refresh_token to an empty string
            { where: { id: userId } } // Find the user by ID
        );

        CartProduct.destroy({
            where: { userId: userId } // Clear the user's cart
        });

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

        const userId = verifyToken?.id

        const newAccessToken =  generatedAccessToken(userId)

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
