const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Admin authorization required.' });
        }
        next();
    } catch (error) {
        console.error('Admin Middleware Error:', error.message);
        return res.status(500).json({ success: false, message: 'Authorization error.' });
    }
};

export default adminMiddleware;
