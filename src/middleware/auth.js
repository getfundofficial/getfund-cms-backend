const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Verify JWT token middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = auth;
