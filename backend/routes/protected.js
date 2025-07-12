const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole, requireAdmin } = require('../middleware/authMiddleware');
const db = require('../db/db');

// Example: Protected route that requires authentication
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = req.user; // User info added by authMiddleware
        
        res.json({
            success: true,
            message: 'This is a protected route',
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                accessTime: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error accessing protected resource'
        });
    }
});

// Example: Route that requires specific role (owner or admin)
router.get('/dashboard', authMiddleware, requireRole(['owner', 'admin']), async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get user's restaurant data
        const restaurant = await db('restaurants')
            .where({ user_id: userId })
            .first();
            
        res.json({
            success: true,
            message: 'Welcome to your dashboard',
            user: req.user,
            restaurant: restaurant || null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error loading dashboard'
        });
    }
});

// Example: Admin-only route
router.get('/admin/users', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const users = await db('users')
            .select('id', 'email', 'role', 'created_at')
            .orderBy('created_at', 'desc');
            
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Example: Route with optional authentication
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/public-with-user-info', optionalAuth, (req, res) => {
    const response = {
        success: true,
        message: 'This route is public but can show user info if logged in',
        timestamp: new Date()
    };
    
    if (req.user) {
        response.user = {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        };
        response.message += ' - You are logged in!';
    } else {
        response.message += ' - You are not logged in.';
    }
    
    res.json(response);
});

module.exports = router;
