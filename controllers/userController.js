const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Get user profile
exports.getProfile = async (request, response) => {
    const userId = request.user.id; // Assuming user ID is available in request after authentication

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        response.json({
            id: user.id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            byteBalance: user.byteBalance,
            bio: user.bio,
            orderHistory: user.orderHistory
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyToken = async (request, response) => {
    const token = request.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return response.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID from token payload
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return response.status(404).json({ message: 'User not found' });
        }

        response.json({
            message: 'Token is valid',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber,
                byteBalance: user.byteBalance,
                bio: user.bio,
                orderHistory: user.orderHistory
            }
        });
    } catch (error) {
        console.error(error);
        response.status(401).json({ message: 'Invalid token' });
    }
};
