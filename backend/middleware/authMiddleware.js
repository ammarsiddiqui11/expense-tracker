// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET 

exports.protect = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'not authorized, token missing' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'no user found for token' });

    // req.user = { id: user._id, email: user.email, username: user.username };
    req.user = user;
    next();
  } catch(err) {
    console.error(err);
    return res.status(401).json({ message: 'token invalid or expired' });
  }
};
