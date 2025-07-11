const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import the middleware

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Login a user
router.post('/login', authController.login);

// POST /api/auth/logout - Logout a user (clear session)
router.post('/logout', authController.logout);

// GET /api/auth/me - Get current authenticated user's details
// Apply the authMiddleware to protect this route
router.get('/me', authMiddleware.authMiddleware, authController.getMe);

module.exports = router;
