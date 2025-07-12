const db = require('../db/db');
const { hashPassword, comparePassword, validatePassword, validateEmail } = require('../utils/hashPassword');
const { generateToken, generateRefreshToken, setAuthCookies, clearAuthCookies } = require('../utils/jwtToken');

// POST /register
exports.register = async (req, res) => {
    console.log("[Auth Controller] Register request received.");
    let { email, password } = req.body; // Use let to allow modification
    console.log("[Auth Controller] Register Body:", { email, password: '[REDACTED]' });

    // Trim email before validation
    email = email ? email.trim() : '';

    if (!email || !password) {
        console.log("[Auth Controller] Register failed: Missing email or password.");
        return res.status(400).json({ message: 'Email and password are required' });
    }
    // Basic email format validation (more robust validation recommended for production)
    if (!/\S+@\S+\.\S+/.test(email)) { // Validate trimmed email
         console.log("[Auth Controller] Register failed: Invalid email format.");
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 6) {
        console.log("[Auth Controller] Register failed: Password too short.");
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if user already exists
        console.log("[Auth Controller] Finding user by email:", email);
        const existingUser = await db('users').where({ email }).first();

        if (existingUser) {
            console.log("[Auth Controller] Register failed: Email already taken.");
            return res.status(409).json({ message: 'Email already registered' }); // 409 Conflict
        }

        // Hash password using utility
        console.log("[Auth Controller] Hashing password for email:", email);
        const hashedPassword = await hashPassword(password);
        console.log("[Auth Controller] Password hashed.");

        // Create new user (default role is 'owner' as per migration)
        console.log("[Auth Controller] Email available, creating user:", email);
        const insertResult = await db('users').insert({
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            role: 'owner',
            created_at: new Date(),
            updated_at: new Date()
        });

        // MySQL doesn't support .returning(), so we need to fetch the user manually
        const newUserId = insertResult[0]; // MySQL returns the insert ID
        const newUser = await db('users')
            .select('id', 'email', 'role', 'created_at')
            .where({ id: newUserId })
            .first();

        console.log("[Auth Controller] User created successfully:", { userId: newUser.id, email: newUser.email });

        // CRITICAL: Clear any existing cookies/sessions before setting new ones
        clearAuthCookies(res);

        // Clear legacy cookies that might exist
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };
        res.clearCookie('authToken', cookieOptions);
        res.clearCookie('token', cookieOptions);
        res.clearCookie('jwt', cookieOptions);

        // Generate NEW tokens for immediate login (no restaurant yet for new users)
        const accessToken = generateToken(newUser, null);
        const refreshToken = generateRefreshToken(newUser);

        // Set NEW secure cookies
        setAuthCookies(res, accessToken, refreshToken);

        // Add cache control headers to prevent stale data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                created_at: newUser.created_at,
                restaurant_id: null // Explicitly show no restaurant yet
            },
            token: accessToken,
            clearStorage: true // Signal frontend to clear localStorage
        });

    } catch (error) {
        console.error("[Auth Controller] Error during registration:", error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// POST /login
exports.login = async (req, res) => {
    console.log("[Auth Controller] Login request received.");
    const { email, password } = req.body;
    console.log("[Auth Controller] Login Body:", { email, password: '[REDACTED]' });

    if (!email || !password) {
        console.log("[Auth Controller] Login failed: Missing email or password.");
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find user by email
        console.log("[Auth Controller] Finding user by email:", email);
        const user = await db('users').where({ email }).first();

        if (!user) {
            console.log("[Auth Controller] Login failed: User not found.");
            return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
        }

        // Compare password using utility
        console.log("[Auth Controller] User found, comparing password for email:", email);
        const isMatch = await comparePassword(password, user.password_hash);

        if (!isMatch) {
            console.log("[Auth Controller] Login failed: Password mismatch for email:", email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Passwords match, fetch associated restaurant data
        console.log("[Auth Controller] Password matched, fetching restaurant data for user:", user.id);
        const restaurant = await db('restaurants').where({ user_id: user.id }).first();
        const restaurantId = restaurant ? restaurant.id : null;
        const restaurantSlug = restaurant ? restaurant.slug : null;
        console.log("[Auth Controller] Found restaurant:", { id: restaurantId, slug: restaurantSlug });

        // CRITICAL: Clear any existing cookies/sessions before setting new ones
        console.log("[Auth Controller] Clearing previous session for email:", email);
        clearAuthCookies(res);

        // Clear legacy cookies that might exist
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };
        res.clearCookie('authToken', cookieOptions);
        res.clearCookie('token', cookieOptions);
        res.clearCookie('jwt', cookieOptions);

        // Generate NEW tokens with restaurant ID for data isolation
        console.log("[Auth Controller] Generating NEW tokens for email:", email);
        const accessToken = generateToken(user, restaurantId);
        const refreshToken = generateRefreshToken(user);

        // Set NEW secure HTTP-only cookies for persistent session
        setAuthCookies(res, accessToken, refreshToken);

        // Update last login time (remove last_login field since it doesn't exist)
        await db('users')
            .where({ id: user.id })
            .update({
                updated_at: new Date()
            });

        // Add cache control headers to prevent stale data
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        console.log("[Auth Controller] Login successful with NEW session for email:", email);
        res.json({
            success: true,
            message: 'Login successful',
            token: accessToken, // Send NEW token for client-side storage
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                restaurant_id: restaurantId,
                restaurantSlug: restaurantSlug
            },
            clearStorage: true // Signal frontend to clear localStorage
        });

    } catch (error) {
        console.error("[Auth Controller] Error during login:", error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
};

// POST /logout - Clear session and cookies completely
exports.logout = async (req, res) => {
    try {
        console.log("[Auth Controller] Logout request received");

        // Clear ALL authentication cookies with multiple variations
        clearAuthCookies(res);

        // Also clear any legacy cookie names that might exist
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        };

        // Clear multiple possible cookie names
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('authToken', cookieOptions); // Legacy name
        res.clearCookie('token', cookieOptions); // Another possible name
        res.clearCookie('jwt', cookieOptions); // Another possible name

        // If user is authenticated, log the logout
        if (req.user) {
            console.log(`[Auth Controller] User ${req.user.email} (ID: ${req.user.id}) logged out successfully`);

            // Update user's logout time (remove last_logout field since it doesn't exist)
            await db('users')
                .where({ id: req.user.id })
                .update({
                    updated_at: new Date()
                });
        }

        // Send response with explicit cache control headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json({
            success: true,
            message: 'Logged out successfully',
            clearStorage: true // Signal frontend to clear localStorage
        });

    } catch (error) {
        console.error("[Auth Controller] Error during logout:", error);
        res.status(500).json({
            success: false,
            message: 'Error during logout',
            code: 'LOGOUT_ERROR'
        });
    }
};

// GET /me - Get current authenticated user's details
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user with restaurant data
        const user = await db('users')
            .select('id', 'email', 'role', 'created_at', 'updated_at', 'last_login')
            .where({ id: userId })
            .first();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Get associated restaurant
        const restaurant = await db('restaurants')
            .select('id', 'name', 'slug', 'description', 'logo_path')
            .where({ user_id: userId })
            .first();

        res.json({
            success: true,
            user: {
                ...user,
                restaurant: restaurant || null
            }
        });

    } catch (error) {
        console.error("[Auth Controller] Error getting user profile:", error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user profile',
            code: 'PROFILE_ERROR'
        });
    }
};

// POST /refresh - Refresh access token using refresh token
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required',
                code: 'NO_REFRESH_TOKEN'
            });
        }

        // Verify refresh token
        const { verifyToken } = require('../utils/jwtToken');
        const decoded = verifyToken(refreshToken);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                code: 'INVALID_REFRESH_TOKEN'
            });
        }

        // Get user from database
        const user = await db('users')
            .select('id', 'email', 'role')
            .where({ id: decoded.id })
            .first();

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Generate new access token
        const newAccessToken = generateToken(user);

        // Set new access token cookie
        setAuthCookies(res, newAccessToken);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            token: newAccessToken
        });

    } catch (error) {
        console.error("[Auth Controller] Error refreshing token:", error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
            code: 'REFRESH_ERROR'
        });
    }
};

// PUT /me - Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;

        // Validate email if provided
        if (email && !validateEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                code: 'INVALID_EMAIL'
            });
        }

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await db('users')
                .where({ email: email.toLowerCase() })
                .whereNot({ id: userId })
                .first();

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use',
                    code: 'EMAIL_EXISTS'
                });
            }
        }

        // Update user
        const updateData = {
            updated_at: new Date()
        };

        if (email) {
            updateData.email = email.toLowerCase();
        }

        await db('users')
            .where({ id: userId })
            .update(updateData);

        // Get updated user
        const updatedUser = await db('users')
            .select('id', 'email', 'role', 'created_at', 'updated_at')
            .where({ id: userId })
            .first();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error("[Auth Controller] Error updating profile:", error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            code: 'UPDATE_ERROR'
        });
    }
};

// POST /change-password - Change user's password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
                code: 'MISSING_PASSWORDS'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match',
                code: 'PASSWORD_MISMATCH'
            });
        }

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'New password does not meet requirements',
                errors: passwordValidation.errors,
                code: 'WEAK_PASSWORD'
            });
        }

        // Get current user
        const user = await db('users')
            .select('password_hash')
            .where({ id: userId })
            .first();

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }

        // Hash new password
        const newHashedPassword = await hashPassword(newPassword);

        // Update password
        await db('users')
            .where({ id: userId })
            .update({
                password_hash: newHashedPassword,
                updated_at: new Date()
            });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error("[Auth Controller] Error changing password:", error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            code: 'PASSWORD_CHANGE_ERROR'
        });
    }
};

// POST /clear-session - Force clear all sessions (emergency logout)
exports.clearSession = async (req, res) => {
    try {
        console.log("[Auth Controller] Force session clear requested");

        // Clear ALL possible cookies with different configurations
        const cookieConfigs = [
            { httpOnly: true, secure: false, sameSite: 'strict', path: '/' },
            { httpOnly: true, secure: true, sameSite: 'strict', path: '/' },
            { httpOnly: false, secure: false, sameSite: 'strict', path: '/' },
            { httpOnly: false, secure: true, sameSite: 'strict', path: '/' },
            { path: '/' },
            { path: '/api/auth/refresh' }
        ];

        const cookieNames = ['accessToken', 'refreshToken', 'authToken', 'token', 'jwt'];

        // Clear cookies with all possible configurations
        cookieNames.forEach(name => {
            cookieConfigs.forEach(config => {
                res.clearCookie(name, config);
            });
        });

        // Set aggressive cache control headers
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Clear-Site-Data': '"cache", "cookies", "storage"'
        });

        console.log("[Auth Controller] All sessions cleared forcefully");
        res.json({
            success: true,
            message: 'All sessions cleared successfully',
            clearStorage: true,
            forceReload: true
        });

    } catch (error) {
        console.error("[Auth Controller] Error clearing session:", error);
        res.status(500).json({
            success: false,
            message: 'Error clearing session',
            code: 'CLEAR_SESSION_ERROR'
        });
    }
};

// GET /debug-session - Debug current session (REMOVE IN PRODUCTION)
exports.debugSession = async (req, res) => {
    try {
        console.log("[Auth Controller] Debug session request");

        // Get token from different sources
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies?.accessToken;
        const legacyCookieToken = req.cookies?.authToken;

        // Extract token
        let headerToken = null;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                headerToken = parts[1];
            }
        }

        // Decode tokens without verification for debugging
        const jwt = require('jsonwebtoken');
        let headerDecoded = null;
        let cookieDecoded = null;
        let legacyCookieDecoded = null;

        try {
            if (headerToken) headerDecoded = jwt.decode(headerToken);
            if (cookieToken) cookieDecoded = jwt.decode(cookieToken);
            if (legacyCookieToken) legacyCookieDecoded = jwt.decode(legacyCookieToken);
        } catch (decodeError) {
            console.log("Token decode error:", decodeError.message);
        }

        // Get user from database if available
        let dbUser = null;
        let dbRestaurant = null;
        if (req.user) {
            dbUser = await db('users')
                .select('id', 'email', 'role', 'created_at')
                .where({ id: req.user.id })
                .first();

            dbRestaurant = await db('restaurants')
                .select('id', 'name', 'slug', 'user_id')
                .where({ user_id: req.user.id })
                .first();
        }

        res.json({
            success: true,
            debug: {
                middleware_user: req.user || null,
                tokens: {
                    header_token: headerToken ? `${headerToken.substring(0, 20)}...` : null,
                    cookie_token: cookieToken ? `${cookieToken.substring(0, 20)}...` : null,
                    legacy_cookie_token: legacyCookieToken ? `${legacyCookieToken.substring(0, 20)}...` : null
                },
                decoded_tokens: {
                    header: headerDecoded,
                    cookie: cookieDecoded,
                    legacy_cookie: legacyCookieDecoded
                },
                database: {
                    user: dbUser,
                    restaurant: dbRestaurant
                },
                cookies: req.cookies,
                headers: {
                    authorization: req.headers.authorization,
                    'user-agent': req.headers['user-agent']
                }
            }
        });

    } catch (error) {
        console.error("[Auth Controller] Error in debug session:", error);
        res.status(500).json({
            success: false,
            message: 'Error debugging session',
            error: error.message
        });
    }
};

// GET /me - Requires authentication middleware to be applied in routes
exports.getMe = async (req, res) => {
    // req.user should be populated by the auth middleware with JWT payload ({ id, email, role })
    if (!req.user || !req.user.id) {
         console.error("[Auth Controller] /me endpoint called without authenticated user.");
        return res.status(401).json({ message: 'Not authenticated' });
    }

    console.log(`[Auth Controller] /me request received for user ID: ${req.user.id}`);

    try {
        // Fetch user details from DB based on ID from token
        // Exclude password_hash
        const user = await db('users')
            .where({ id: req.user.id })
            .select('id', 'email', 'role', 'created_at', 'updated_at')
            .first();

        if (!user) {
            console.error(`[Auth Controller] Authenticated user ID ${req.user.id} not found in database.`);
            // This case should ideally not happen if JWT is valid and user wasn't deleted
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`[Auth Controller] Returning user details for ID: ${user.id}`);
        res.json({ user });

    } catch (error) {
        console.error(`[Auth Controller] Error fetching user details for ID ${req.user.id}:`, error);
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
};
