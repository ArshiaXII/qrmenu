const db = require('../db/db');
const { hashPassword, comparePassword, validatePassword, validateEmail } = require('../utils/hashPassword');
const { generateToken, generateRefreshToken, setAuthCookies, clearAuthCookies } = require('../utils/jwtToken');

// POST /register - COMPLETELY REBUILT FOR SECURITY
exports.register = async (req, res) => {
    console.log("[Auth Controller] 📝 REGISTRATION ATTEMPT STARTED");
    const { email, password, confirmPassword } = req.body;
    console.log("[Auth Controller] Registration attempt for email:", email);

    // Step 1: Validate input
    if (!email || !password) {
        console.log("[Auth Controller] ❌ REGISTRATION FAILED: Missing email or password");
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
            code: 'MISSING_CREDENTIALS'
        });
    }

    // Step 2: Validate email format
    if (!validateEmail(email)) {
        console.log("[Auth Controller] ❌ REGISTRATION FAILED: Invalid email format:", email);
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address',
            code: 'INVALID_EMAIL'
        });
    }

    // Step 3: Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        console.log("[Auth Controller] ❌ REGISTRATION FAILED: Weak password");
        return res.status(400).json({
            success: false,
            message: 'Password does not meet requirements',
            errors: passwordValidation.errors,
            code: 'WEAK_PASSWORD'
        });
    }

    // Step 4: Check password confirmation if provided
    if (confirmPassword && password !== confirmPassword) {
        console.log("[Auth Controller] ❌ REGISTRATION FAILED: Passwords do not match");
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match',
            code: 'PASSWORD_MISMATCH'
        });
    }

    try {
        // Step 5: Check if user already exists
        console.log("[Auth Controller] 🔍 Checking if email already exists:", email);
        const existingUser = await db('users')
            .select('id', 'email')
            .where({ email: email.toLowerCase() })
            .first();

        if (existingUser) {
            console.log("[Auth Controller] ❌ REGISTRATION FAILED: Email already exists:", email);
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
                code: 'EMAIL_EXISTS'
            });
        }

        console.log("[Auth Controller] ✅ Email is available for registration");

        // Step 6: Hash password with bcrypt (12 salt rounds)
        console.log("[Auth Controller] 🔐 Hashing password with bcrypt");
        const hashedPassword = await hashPassword(password);

        // Step 7: Insert new user into database
        console.log("[Auth Controller] 💾 Creating new user in database");
        const insertResult = await db('users').insert({
            email: email.toLowerCase(),
            password_hash: hashedPassword,
            role: 'owner',
            created_at: new Date(),
            updated_at: new Date()
        });

        // Step 8: Fetch the newly created user (MySQL doesn't support .returning())
        const newUserId = insertResult[0];
        const newUser = await db('users')
            .select('id', 'email', 'role', 'created_at')
            .where({ id: newUserId })
            .first();

        if (!newUser) {
            console.log("[Auth Controller] ❌ REGISTRATION FAILED: Could not fetch created user");
            return res.status(500).json({
                success: false,
                message: 'Error creating user account',
                code: 'USER_CREATION_ERROR'
            });
        }

        console.log("[Auth Controller] ✅ User created successfully. ID:", newUser.id, "Email:", newUser.email);

        // Step 9: Clear any existing sessions/cookies
        console.log("[Auth Controller] 🧹 Clearing previous sessions");
        clearAuthCookies(res);

        // Step 10: Generate JWT token for immediate login
        console.log("[Auth Controller] 🎫 Generating JWT token for new user");
        const accessToken = generateToken(newUser, null); // No restaurant yet
        const refreshToken = generateRefreshToken(newUser);

        // Step 11: Set secure HTTP-only cookies
        console.log("[Auth Controller] 🍪 Setting secure authentication cookies");
        setAuthCookies(res, accessToken, refreshToken);

        // Step 12: Send successful response
        console.log("[Auth Controller] ✅ REGISTRATION SUCCESSFUL for user:", newUser.email, "ID:", newUser.id);
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token: accessToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                created_at: newUser.created_at,
                restaurant_id: null // No restaurant yet
            }
        });

    } catch (error) {
        console.error("[Auth Controller] ❌ REGISTRATION ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            code: 'REGISTRATION_ERROR'
        });
    }
};

// POST /login - COMPLETELY REBUILT FOR SECURITY
exports.login = async (req, res) => {
    console.log("[Auth Controller] 🔐 LOGIN ATTEMPT STARTED");
    const { email, password } = req.body;
    console.log("[Auth Controller] Login attempt for email:", email);

    // Step 1: Validate input
    if (!email || !password) {
        console.log("[Auth Controller] ❌ LOGIN FAILED: Missing email or password");
        return res.status(400).json({
            success: false,
            message: 'Email and password are required',
            code: 'MISSING_CREDENTIALS'
        });
    }

    // Step 2: Validate email format
    if (!validateEmail(email)) {
        console.log("[Auth Controller] ❌ LOGIN FAILED: Invalid email format:", email);
        return res.status(400).json({
            success: false,
            message: 'Invalid email format',
            code: 'INVALID_EMAIL_FORMAT'
        });
    }

    try {
        // Step 3: Check if user exists in database
        console.log("[Auth Controller] 🔍 Checking if user exists in database:", email);
        const user = await db('users')
            .select('id', 'email', 'password_hash', 'role', 'created_at')
            .where({ email: email.toLowerCase() })
            .first();

        if (!user) {
            console.log("[Auth Controller] ❌ LOGIN FAILED: User does not exist in database:", email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        console.log("[Auth Controller] ✅ User found in database. User ID:", user.id);

        // Step 4: Verify password using bcrypt
        console.log("[Auth Controller] 🔐 Verifying password for user:", user.id);
        const isPasswordValid = await comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            console.log("[Auth Controller] ❌ LOGIN FAILED: Password is incorrect for user:", user.id);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        console.log("[Auth Controller] ✅ Password verified successfully for user:", user.id);

        // Step 5: Fetch user's restaurant data
        console.log("[Auth Controller] 🏪 Fetching restaurant data for user:", user.id);
        const restaurant = await db('restaurants')
            .select('id', 'name', 'slug')
            .where({ user_id: user.id })
            .first();

        const restaurantId = restaurant ? restaurant.id : null;
        const restaurantSlug = restaurant ? restaurant.slug : null;
        console.log("[Auth Controller] Restaurant data:", {
            id: restaurantId,
            name: restaurant?.name || 'None',
            slug: restaurantSlug
        });

        // Step 6: Clear any existing sessions/cookies
        console.log("[Auth Controller] 🧹 Clearing previous sessions");
        clearAuthCookies(res);

        // Step 7: Generate NEW JWT token with user and restaurant data
        console.log("[Auth Controller] 🎫 Generating new JWT token for user:", user.id);
        const accessToken = generateToken(user, restaurantId);
        const refreshToken = generateRefreshToken(user);

        // Step 8: Set secure HTTP-only cookies
        console.log("[Auth Controller] 🍪 Setting secure authentication cookies");
        setAuthCookies(res, accessToken, refreshToken);

        // Step 9: Update user's last activity
        await db('users')
            .where({ id: user.id })
            .update({ updated_at: new Date() });

        // Step 10: Send successful response
        console.log("[Auth Controller] ✅ LOGIN SUCCESSFUL for user:", user.email, "ID:", user.id);
        res.json({
            success: true,
            message: 'Login successful',
            token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                restaurant_id: restaurantId,
                restaurant_name: restaurant?.name || null,
                restaurant_slug: restaurantSlug
            }
        });

    } catch (error) {
        console.error("[Auth Controller] ❌ LOGIN ERROR:", error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            code: 'LOGIN_ERROR'
        });
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

// GET /debug/me - Debug endpoint to verify authentication (REMOVE IN PRODUCTION)
exports.debugMe = async (req, res) => {
    try {
        console.log("[Auth Controller] 🔍 DEBUG /me endpoint called");
        console.log("[Auth Controller] req.user:", req.user);

        if (!req.user || !req.user.id) {
            console.log("[Auth Controller] ❌ No authenticated user found");
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
                user: null
            });
        }

        // Return the authenticated user data
        res.json({
            success: true,
            user_id: req.user.id,
            restaurant_id: req.user.restaurant_id,
            email: req.user.email,
            role: req.user.role,
            restaurant_name: req.user.restaurant_name,
            restaurant_slug: req.user.restaurant_slug
        });

    } catch (error) {
        console.error("[Auth Controller] Error in debug me:", error);
        res.status(500).json({
            success: false,
            message: 'Error getting user data',
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
