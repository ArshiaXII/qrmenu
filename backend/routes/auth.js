const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register a new user
router.post('/register', authController.register);

// POST /api/auth/login - Login a user
router.post('/login', authController.login);

// POST /api/auth/logout - Logout a user (clear session)
router.post('/logout', optionalAuth, authController.logout);

// POST /api/auth/clear-session - Force clear all sessions (emergency logout)
router.post('/clear-session', authController.clearSession);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken);

// GET /api/auth/me - Get current authenticated user's details
router.get('/me', authMiddleware, authController.getMe);

// GET /api/auth/debug-session - Debug current session (REMOVE IN PRODUCTION)
router.get('/debug-session', optionalAuth, authController.debugSession);

// PUT /api/auth/me - Update current user's profile
router.put('/me', authMiddleware, authController.updateProfile);

// POST /api/auth/change-password - Change user's password
router.post('/change-password', authMiddleware, authController.changePassword);

// POST /api/auth/forgot-password - Request password reset (future feature)
// router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password - Reset password with token (future feature)
// router.post('/reset-password', authController.resetPassword);

module.exports = router;
