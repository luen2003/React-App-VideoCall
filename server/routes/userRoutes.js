const express = require('express');
const { authUser, registerUser, getUsers } = require('../controllers/userController.js'); 
const router = express.Router(); 

// Route for user registration and fetching all users
router.route('/')
  .post(registerUser)
  .get(getUsers); 

// Route for user login
router.post('/login', authUser);

module.exports = router;