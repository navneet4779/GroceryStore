import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

const generatedRefreshToken = async (userId) => {
    try {
        // Generate the refresh token
        const token = jwt.sign(
            { id: userId },
            process.env.SECRET_KEY_REFRESH_TOKEN,
            { expiresIn: "7d" }
        );
        // Update the refresh token in the database
        const updateRefreshTokenUser = await UserModel.update(
            { refresh_token: token }, // Set the new refresh token
            { where: { id: userId } } // Find the user by ID
        );

        if (updateRefreshTokenUser[0] === 0) {
            throw new Error("Failed to update refresh token for the user");
        }

        return token;
    } catch (error) {
        console.error("Error generating refresh token:", error.message);
        throw error;
    }
};

export default generatedRefreshToken;