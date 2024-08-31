
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Get the token from the headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });

        req.user = user; // Attach user info to request
        next(); // Proceed to next middleware or route handler
    });
};

module.exports = authenticateToken;
