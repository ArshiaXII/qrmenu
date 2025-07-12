const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // 7 days default

/**
 * Generate a JWT token for a user
 * @param {object} user - User object with id, email, role
 * @param {number} restaurantId - Optional restaurant ID to include in token
 * @returns {string} - JWT token
 */
const generateToken = (user, restaurantId = null) => {
    try {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role || 'user',
            restaurant_id: restaurantId, // Include restaurant ID for data isolation
            iat: now, // Issued at time
            jti: `${user.id}-${now}-${Math.random().toString(36).substr(2, 9)}`, // Unique token ID
            session_id: `sess_${user.id}_${now}_${Math.random().toString(36).substr(2, 9)}` // Unique session ID
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'qr-menu-platform',
            audience: 'qr-menu-users'
        });

        console.log(`[JWT] Generated new token for user ${user.id} with session ${payload.session_id}`);
        return token;
    } catch (error) {
        console.error('Error generating JWT token:', error);
        throw new Error('Token generation failed');
    }
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'qr-menu-platform',
            audience: 'qr-menu-users'
        });

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else if (error.name === 'NotBeforeError') {
            throw new Error('Token not active yet');
        } else {
            console.error('Error verifying JWT token:', error);
            throw new Error('Token verification failed');
        }
    }
};

/**
 * Generate a refresh token (longer expiry)
 * @param {object} user - User object
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (user) => {
    try {
        const payload = {
            id: user.id,
            email: user.email,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        };

        const refreshToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: '30d', // 30 days for refresh token
            issuer: 'qr-menu-platform',
            audience: 'qr-menu-users'
        });

        return refreshToken;
    } catch (error) {
        console.error('Error generating refresh token:', error);
        throw new Error('Refresh token generation failed');
    }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    
    return parts[1];
};

/**
 * Set secure HTTP-only cookie with JWT token
 * @param {object} res - Express response object
 * @param {string} token - JWT token
 * @param {string} refreshToken - Refresh token (optional)
 */
const setAuthCookies = (res, token, refreshToken = null) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Set access token cookie
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });

    // Set refresh token cookie if provided
    if (refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/api/auth/refresh'
        });
    }
};

/**
 * Clear authentication cookies
 * @param {object} res - Express response object
 */
const clearAuthCookies = (res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/'
    });
    
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/api/auth/refresh'
    });
};

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
    extractTokenFromHeader,
    setAuthCookies,
    clearAuthCookies
};
