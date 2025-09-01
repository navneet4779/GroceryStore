import jwt from 'jsonwebtoken';

const generatedAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '5h' }
    );
};

export default generatedAccessToken;