import jwt from 'jsonwebtoken';

const auth = async (request, response, next) => {
    try {
        const token = request.cookies?.accessToken || (request?.headers?.authorization?.startsWith("Bearer ") ? request.headers.authorization.split(" ")[1] : null);
    
        if (!token) {
            return response.status(401).json({
                message: "Provide token",
                error: true,
                success: false,
            });
        }

        const decode = await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        if (!decode) {
            return response.status(401).json({
                message: "Unauthorized access",
                error: true,
                success: false,
            });
        }
        console.log("Request Headers:", decode.id); // Debugging
        request.userId = decode.id;
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message); // Debugging
        return response.status(500).json({
            message: error.message || "You have not login",
            error: true,
            success: false,
        });
    }
};

export default auth;