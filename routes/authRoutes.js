const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { 
  register, 
  login, 
  getMe, 
  updateProfile 
} = require('../controllers/authController');

// @route    POST api/auth/register
// @desc     Register user & get token
router.post('/register', register);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
router.post('/login', login);

// @route    GET api/auth/me
// @desc     Get current user data
// @access   Private
router.get('/me', auth, getMe);

// @route    PUT api/auth/profile
// @desc     Update user profile (Name, Banks, Cycle Day, etc.)
// @access   Private
// CHANGED: From '/update' to '/profile' to match frontend logic
router.put('/profile', auth, updateProfile);

module.exports = router;