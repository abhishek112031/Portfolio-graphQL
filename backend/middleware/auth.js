const jwt = require('jsonwebtoken');
const User = require('../models/user.models');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        const token = authHeader
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = await User.findById(decoded.id);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid token.' });
        }
    }
    next();
};

module.exports = authenticate;
