// middleware/authMiddleware.js — Protects routes that require login

const jwt = require('jsonwebtoken');
const User = require('./User');

const protect = async (req, res, next) => {
  let token;

  // Tokens are sent in the Authorization header as: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract just the token part (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user object to the request (without the password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Continue to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
