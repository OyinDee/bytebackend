const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate'); // Middleware to check if user is logged in

// Route to get user info
router.get('/profile', authenticate, userController.getProfile);
router.get('/verifytoken', userController.verifyToken);
// Other user-related routes can go here

module.exports = router;
