const db = require('../db/db');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwtToken');

/**
 * Main authentication middleware
 * Protects routes by verifying JWT tokens from headers or cookies
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.accessToken;

        // Extract token (Bearer token or cookie)
        let token = extractTokenFromHeader(authHeader) || cookieToken;

        if (!token) {
            console.log("[Auth Middleware] Access denied. No token provided.");
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        // Verify JWT token
        const decoded = verifyToken(token);

        // Get fresh user data from database
        const user = await db('users')
            .select('id', 'email', 'role', 'created_at', 'updated_at')
            .where({ id: decoded.id })
            .first();

        if (!user) {
            console.log("[Auth Middleware] User not found in database.");
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.',
                code: 'USER_NOT_FOUND'
            });
        }

        // Get user's restaurant for data isolation
        const restaurant = await db('restaurants')
            .select('id', 'name', 'slug')
            .where({ user_id: user.id })
            .first();

        // Add user info to request object with restaurant_id for data isolation
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
            restaurant_id: restaurant ? restaurant.id : null, // Critical for data isolation
            restaurant_name: restaurant ? restaurant.name : null,
            restaurant_slug: restaurant ? restaurant.slug : null
        };

        console.log(`[Auth Middleware] ✅ Authenticated user: ${user.email} (ID: ${user.id}, Restaurant ID: ${req.user.restaurant_id})`);
        console.log(`[Auth Middleware] 🏪 Restaurant: ${req.user.restaurant_name || 'None'} (${req.user.restaurant_slug || 'No slug'})`);
        next();

    } catch (error) {
        console.error("[Auth Middleware] Authentication failed:", error.message);

        // Handle specific JWT errors
        if (error.message.includes('expired')) {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.message.includes('Invalid token')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error. Please try again.',
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Optional authentication middleware
 * Adds user info to request if token is valid, but doesn't block access
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.accessToken;
        const token = extractTokenFromHeader(authHeader) || cookieToken;

        if (token) {
            const decoded = verifyToken(token);
            const user = await db('users')
                .select('id', 'email', 'role')
                .where({ id: decoded.id })
                .first();

            if (user) {
                req.user = user;
                console.log(`[Optional Auth] User identified: ${user.email}`);
            }
        }

        next();
    } catch (error) {
        // Continue without authentication for optional auth
        console.log("[Optional Auth] Token invalid, continuing without auth");
        next();
    }
};

/**
 * Role-based authorization middleware
 * Use after authMiddleware to check user roles
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions',
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

/**
 * Admin-only middleware
 */
const requireAdmin = requireRole(['admin']);

/**
 * Owner or Admin middleware
 */
const requireOwnerOrAdmin = requireRole(['owner', 'admin']);

module.exports = {
    authMiddleware,
    optionalAuth,
    requireRole,
    requireAdmin,
    requireOwnerOrAdmin
};
