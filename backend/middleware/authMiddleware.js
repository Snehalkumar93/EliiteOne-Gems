import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        let token;
        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        } else {
            // Backward compatibility for legacy "token" header
            token = req.headers.token;
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Please login again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        // Backward compatibility for controllers expecting req.body.userId
        req.body.userId = decoded.id;
        
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export default authMiddleware;
