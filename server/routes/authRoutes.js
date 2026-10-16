const express = require('express');
const router  = express.Router();
const {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Registration & email verification
router.post('/register',             registerUser);
router.get('/verify-email/:token',   verifyEmail);
router.post('/resend-verification',  resendVerification);

// Login
router.post('/login',  loginUser);
router.post('/google', googleAuth);

// Password reset (two-step, token-based)
router.post('/forgot-password',        forgotPassword);
router.post('/reset-password/:token',  resetPassword);

// Protected
router.get('/me', protect, getMe);

module.exports = router;
