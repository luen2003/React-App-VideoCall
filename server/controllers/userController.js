const asyncHandler = require('express-async-handler');
const User = require('../models/userModels.js'); // Import the User model
const generateToken = require('../utils/generateToken.js'); // Import JWT generation utility

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  // Find the user by name
  const user = await User.findOne({ name });

  if (!user) {
    res.status(401);
    throw new Error('Invalid name or password');
  }

  // Check if the password is correct
  if (await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      token: generateToken(user._id), // Send token upon successful login
    });
  } else {
    res.status(401);
    throw new Error('Invalid name or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;

  const userExists = await User.findOne({ name });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      token: generateToken(user._id), // Send token upon successful registration
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

module.exports =  { authUser, registerUser };
