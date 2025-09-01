const express = require('express');
const { authUser, registerUser, getAllUsers } = require('../controllers/userController.js'); // Import controllers
const router = express.Router();  // Correct usage of express.Router()

// Route for user registration (POST /api/users)
router.route('/').post(registerUser);

// Route for user login (POST /api/users/login)
router.post('/login', authUser);

// Other routes (e.g., user profile, etc.) can be added as needed
router.get('/', getAllUsers);  // GET /api/users?search=n

module.exports = router;  // Export the router
