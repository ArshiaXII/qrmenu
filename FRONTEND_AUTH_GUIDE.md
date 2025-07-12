# 🔐 Frontend Authentication Integration Guide

## Overview
This guide shows how to integrate the backend authentication system with your frontend React application.

## 1. Authentication Service (Frontend)

Create `frontend/src/services/authService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('authUser') || 'null');
    }

    // Register new user
    async register(email, password, confirmPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            const data = await response.json();

            if (data.success) {
                this.setAuth(data.token, data.user);
            }

            return data;
        } catch (error) {
            throw new Error('Registration failed');
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.setAuth(data.token, data.user);
            }

            return data;
        } catch (error) {
            throw new Error('Login failed');
        }
    }

    // Logout user
    async logout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    // Get current user profile
    async getProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
                credentials: 'include',
            });

            const data = await response.json();
            
            if (data.success) {
                this.user = data.user;
                localStorage.setItem('authUser', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            throw new Error('Failed to get profile');
        }
    }

    // Make authenticated API request
    async apiRequest(url, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
        };

        // Add Authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            
            // Handle token expiration
            if (response.status === 401) {
                const data = await response.json();
                if (data.code === 'TOKEN_EXPIRED') {
                    // Try to refresh token
                    const refreshed = await this.refreshToken();
                    if (refreshed) {
                        // Retry original request with new token
                        config.headers.Authorization = `Bearer ${this.token}`;
                        return fetch(`${API_BASE_URL}${url}`, config);
                    }
                }
                this.clearAuth();
                window.location.href = '/login';
                return response;
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    // Refresh access token
    async refreshToken() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();

            if (data.success) {
                this.setAuth(data.token, this.user);
                return true;
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    // Set authentication data
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
    }

    // Clear authentication data
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get current token
    getToken() {
        return this.token;
    }
}

export default new AuthService();
```

## 2. React Context for Authentication

Create `frontend/src/contexts/AuthContext.js`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            if (authService.isAuthenticated()) {
                // Verify token is still valid
                const profileData = await authService.getProfile();
                if (profileData.success) {
                    setUser(profileData.user);
                    setIsAuthenticated(true);
                } else {
                    authService.clearAuth();
                }
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            authService.clearAuth();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const result = await authService.login(email, password);
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const register = async (email, password, confirmPassword) => {
        try {
            const result = await authService.register(email, password, confirmPassword);
            if (result.success) {
                setUser(result.user);
                setIsAuthenticated(true);
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshProfile: initializeAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
```

## 3. Protected Route Component

Create `frontend/src/components/ProtectedRoute.js`:

```javascript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // Redirect to unauthorized page or dashboard
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
```

## 4. Usage Examples

### In your App.js:
```javascript
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <AdminPanel />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </AuthProvider>
    );
}
```

### In a component:
```javascript
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

function Dashboard() {
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const response = await authService.apiRequest('/protected/dashboard');
            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        }
    };

    return (
        <div>
            <h1>Welcome, {user?.email}!</h1>
            <button onClick={logout}>Logout</button>
            {/* Dashboard content */}
        </div>
    );
}
```

## 5. Key Points

### Security Features:
- ✅ **HTTP-only cookies** for secure token storage
- ✅ **Automatic token refresh** when expired
- ✅ **CSRF protection** with SameSite cookies
- ✅ **XSS protection** with HTTP-only cookies

### User Experience:
- ✅ **Persistent sessions** survive page refresh
- ✅ **Automatic logout** on token expiration
- ✅ **Protected routes** with role-based access
- ✅ **Loading states** during authentication

### Best Practices:
- ✅ **Centralized auth logic** in service and context
- ✅ **Error handling** for network failures
- ✅ **Token validation** on app initialization
- ✅ **Graceful degradation** when auth fails
