const jwt = require('jsonwebtoken');
const User = require('../modules/users/user.model');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No token provided' } });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: `Role '${req.user.role}' is not authorized` }
    });
  }
  next();
};

module.exports = { authenticate, authorize };
