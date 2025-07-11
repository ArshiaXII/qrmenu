const jwt = require('jsonwebtoken');
const db = require('../db/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Enhanced authentication middleware with session persistence
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        const authHeader = req.header('Authorization');
        const cookieToken = req.cookies?.authToken;

        // Extract token (Bearer token or cookie)
        let token = null;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        } else if (cookieToken) {
            token = cookieToken;
        }

        if (!token) {
            console.log("[Auth Middleware] Access denied. No token provided.");
            return res.status(401).json({
                message: 'No token, authorization denied',
                code: 'NO_TOKEN'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database to ensure they still exist and get fresh data
        const user = await db('users')
            .select('id', 'email', 'role', 'created_at')
            .where({ id: decoded.id || decoded.userId })
            .first();

        if (!user) {
            console.log("[Auth Middleware] User not found in database.");
            return res.status(401).json({
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Add user info to request object
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        };

        console.log(`[Auth Middleware] Token verified for user: ${user.email} (ID: ${user.id})`);
        next();

    } catch (err) {
        console.error("[Auth Middleware] Token verification failed:", err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token is expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token is not valid',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(500).json({
            message: 'Authentication error',
            code: 'AUTH_ERROR'
        });
    }
};

// Generate JWT token with proper expiration
const generateToken = (userId, email, role = 'owner') => {
    const payload = {
        id: userId,
        userId: userId, // For backward compatibility
        email,
        role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    return jwt.sign(payload, JWT_SECRET);
};

// Set secure HTTP-only cookie
const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('authToken', token, {
        httpOnly: true,        // Prevents XSS attacks
        secure: isProduction,  // HTTPS only in production
        sameSite: 'strict',    // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
    });
};

// Clear auth cookie
const clearAuthCookie = (res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
};

module.exports = {
    authMiddleware,
    generateToken,
    setAuthCookie,
    clearAuthCookie
};
