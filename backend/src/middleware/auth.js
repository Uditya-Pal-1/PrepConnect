// backend/middleware/auth.js
// middleware components for routes
// middleware help in adding extra steps on the same routes (like auth before redirect)
// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify access token middleware
export const auth = async (req, res, next) => {
    if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured' });
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ message: 'Token is not valid' });
    }

    try {
        const user = await User.findById(decoded.id).select('role tokenVersion');
        if (!user || decoded.ver !== user.tokenVersion) return res.status(401).json({ message: 'Session expired. Please sign in again.' });
        req.user = { id: user._id.toString(), role: user.role };
        next();
    } catch (err) {
        console.error(err);
        res.status(503).json({ message: 'The account service is temporarily unavailable' });
    }
};
