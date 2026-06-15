const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flowcraft_fallback_secret';

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to req.user
 */
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
    }
};

module.exports = auth;
