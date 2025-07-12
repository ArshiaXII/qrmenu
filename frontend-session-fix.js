// Frontend Session Management Fix
// Add this to your frontend authentication service

class SessionManager {
    constructor() {
        this.API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    }

    /**
     * Complete session cleanup - call this before login/register
     */
    clearAllSessions() {
        console.log('[SessionManager] Clearing all sessions...');
        
        // Clear localStorage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (
                key.includes('auth') || 
                key.includes('token') || 
                key.includes('user') || 
                key.includes('session') ||
                key.includes('restaurant')
            )) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        const sessionKeysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (
                key.includes('auth') || 
                key.includes('token') || 
                key.includes('user') || 
                key.includes('session') ||
                key.includes('restaurant')
            )) {
                sessionKeysToRemove.push(key);
            }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
        
        console.log('[SessionManager] Cleared storage keys:', [...keysToRemove, ...sessionKeysToRemove]);
    }

    /**
     * Enhanced login with complete session reset
     */
    async login(email, password) {
        try {
            // STEP 1: Clear all existing sessions first
            this.clearAllSessions();
            
            // STEP 2: Call backend clear-session endpoint
            await this.forceLogout();
            
            // STEP 3: Perform login
            const response = await fetch(`${this.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                // STEP 4: Clear storage again if backend signals to do so
                if (data.clearStorage) {
                    this.clearAllSessions();
                }
                
                // STEP 5: Set new authentication data
                this.setAuth(data.token, data.user);
                console.log('[SessionManager] Login successful with new session');
            }

            return data;
        } catch (error) {
            console.error('[SessionManager] Login failed:', error);
            throw new Error('Login failed');
        }
    }

    /**
     * Enhanced registration with complete session reset
     */
    async register(email, password, confirmPassword) {
        try {
            // STEP 1: Clear all existing sessions first
            this.clearAllSessions();
            
            // STEP 2: Call backend clear-session endpoint
            await this.forceLogout();
            
            // STEP 3: Perform registration
            const response = await fetch(`${this.API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            const data = await response.json();

            if (data.success) {
                // STEP 4: Clear storage again if backend signals to do so
                if (data.clearStorage) {
                    this.clearAllSessions();
                }
                
                // STEP 5: Set new authentication data
                this.setAuth(data.token, data.user);
                console.log('[SessionManager] Registration successful with new session');
            }

            return data;
        } catch (error) {
            console.error('[SessionManager] Registration failed:', error);
            throw new Error('Registration failed');
        }
    }

    /**
     * Force logout - clears everything
     */
    async forceLogout() {
        try {
            // Call backend clear-session endpoint
            await fetch(`${this.API_BASE}/auth/clear-session`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
        } catch (error) {
            console.warn('[SessionManager] Backend clear-session failed:', error);
        }
        
        // Clear frontend storage regardless
        this.clearAllSessions();
    }

    /**
     * Regular logout
     */
    async logout() {
        try {
            await fetch(`${this.API_BASE}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                },
            });
        } catch (error) {
            console.error('[SessionManager] Logout request failed:', error);
        } finally {
            this.clearAllSessions();
        }
    }

    /**
     * Set authentication data
     */
    setAuth(token, user) {
        if (token) {
            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));
            console.log('[SessionManager] Set new auth data for user:', user.email);
        }
    }

    /**
     * Get current token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('authUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Check if authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(url, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                ...options.headers,
            },
            credentials: 'include',
        };

        // Add Authorization header if token exists
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.API_BASE}${url}`, config);
            
            // Handle token expiration or invalid session
            if (response.status === 401) {
                console.warn('[SessionManager] Unauthorized response, clearing session');
                this.clearAllSessions();
                window.location.href = '/login';
                return response;
            }

            return response;
        } catch (error) {
            console.error('[SessionManager] API request failed:', error);
            throw error;
        }
    }
}

// Usage Example:
/*
const sessionManager = new SessionManager();

// For login
const loginResult = await sessionManager.login(email, password);
if (loginResult.success) {
    // Redirect to dashboard
    window.location.href = '/dashboard';
}

// For registration
const registerResult = await sessionManager.register(email, password, confirmPassword);
if (registerResult.success) {
    // Redirect to dashboard or onboarding
    window.location.href = '/dashboard';
}

// For logout
await sessionManager.logout();
window.location.href = '/login';

// For force logout (emergency)
await sessionManager.forceLogout();
window.location.reload();
*/

export default SessionManager;
