const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ message: 'Not authorized, token missing or invalid' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Local accounts must have a verified email before accessing protected routes.
      // Google accounts and pre-migration local accounts have isEmailVerified = true by default.
      if (req.user.authProvider === 'local' && !req.user.isEmailVerified) {
        return res.status(403).json({
          message:              'Please verify your email address before accessing this resource.',
          requiresVerification: true,
          email:                req.user.email,
        });
      }

      return next();
    } catch (error) {
      console.error('[AUTH MIDDLEWARE] Token error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
