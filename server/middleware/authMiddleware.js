const jwt = require('jsonwebtoken');
const asyncHandler = require( 'express-async-handler');
const User = require( '../models/userModels.js');

// Middleware to protect routes requiring authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the token is in the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, 'VIDEO_CALL');

      // Get the user from the token and add it to the request object
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports =  { protect };
