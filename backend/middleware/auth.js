import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        let token = req.cookies?.accessToken;
        if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Token is required",
                error: true,
                success: false,
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);

        // Attach user ID to request
        req.userId = decoded?.id;

        if (!req.userId) {
            return res.status(401).json({
                message: "Invalid token payload",
                error: true,
                success: false,
            });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);

        const statusCode = error.name === "TokenExpiredError" ? 401 : 500;
        return res.status(statusCode).json({
            message: error.name === "TokenExpiredError" 
                ? "Token expired, please log in again" 
                : "Unauthorized access",
            error: true,
            success: false,
        });
    }
};

export default auth;
