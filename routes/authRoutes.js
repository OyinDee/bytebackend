const express = require('express');
const router = express.Router();
const {
    register,
    login,
    verifyEmail,
    sendVerificationCode,
    verifyPhoneNumber,
    forgotPassword,
    resetPassword
} = require('../controllers/authControllers');

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Verify email
router.get('/verify-email', verifyEmail);

// Verify phone number
router.post('/verify-phone-number', verifyPhoneNumber);

// Route to handle forgotten password - sends reset code
router.post('/request-reset-code', forgotPassword);

// Route to handle password reset - confirms new password
router.post('/reset-password', resetPassword);
module.exports = router;
