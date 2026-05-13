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
router.post('/register', register);

// @route    POST api/auth/login
router.post('/login', login);

// @route    GET api/auth/me
router.get('/me', auth, getMe);

// @route    PUT api/auth/update
router.put('/update', auth, updateProfile);

module.exports = router;