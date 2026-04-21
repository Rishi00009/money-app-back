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
// @desc     Register a new user
router.post('/register', register);

// @route    POST api/auth/login
// @desc     Login user and get token
router.post('/login', login);

// @route    GET api/auth/me
// @desc     Get current user data (Private)
router.get('/me', auth, getMe);

// @route    PUT api/auth/update
// @desc     Update profile info, password, and banks (Private)
router.put('/update', auth, updateProfile);

module.exports = router;