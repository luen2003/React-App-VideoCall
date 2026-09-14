const asyncHandler = require('express-async-handler');
const User = require('../models/userModels.js');
const generateToken = require('../utils/generateToken.js');

// Login
const authUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });

  if (!user) {
    res.status(401);
    throw new Error('Invalid name or password');
  }

  if (await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid name or password');
  }
});

// Register
const registerUser = asyncHandler(async (req, res) => {
  const { name, password } = req.body;
  const userExists = await User.findOne({ name });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
    .select('_id name')
    .sort({ name: 1 });

  res.json(users);
});

module.exports = {
  authUser,
  registerUser,
  getUsers,
};