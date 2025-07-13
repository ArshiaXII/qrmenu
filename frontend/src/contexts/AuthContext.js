import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios'; // No longer needed directly
import api from '../services/api'; // Import the configured Axios instance

// Safe localStorage wrapper
const safeLocalStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage access denied:', error);
    }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage access denied:', error);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('localStorage access denied:', error);
    }
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(safeLocalStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true); // Renamed loading to isLoading

    useEffect(() => {
        const checkLoggedIn = async () => {
            const storedToken = safeLocalStorage.getItem('authToken');
            if (storedToken) {
                console.log("Token found in localStorage, attempting to load user data...");
                setToken(storedToken);
                // No need to set default header here, api interceptor handles it
                try {
                    const storedUser = safeLocalStorage.getItem('authUser');
                    if(storedUser) {
                        setUser(JSON.parse(storedUser));
                        console.log("User data loaded from localStorage");
                    } else {
                         // If only token exists, maybe try a /me endpoint if we had one
                         // If not, it's often better to logout to force re-authentication
                         console.warn("Token exists but no user data in localStorage. Logging out.");
                         logout(); // Call logout to clear token
                    }
                } catch (error) {
                    console.error("Error parsing stored user data:", error);
                    logout(); // Clear invalid state
                }
            } else {
                 console.log("No auth token found in localStorage.");
            }
            setIsLoading(false); // Use setIsLoading
        };
        checkLoggedIn();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Added logout to dependency array if it were used inside, but it's defined outside effect scope

    // Production Login Function (Uses Real API)
    const login = async (email, password) => {
        try {
            console.log(`[AuthContext] Making login request to ${api.defaults.baseURL}/auth/login`);

            // Use the api instance to call the real backend
            const response = await api.post('/auth/login', { email, password });
            console.log('[AuthContext] Raw login response:', response);

            if (response.data && response.data.token) {
                const { token: receivedToken, user: userData } = response.data;

                // Store token and user data
                safeLocalStorage.setItem('authToken', receivedToken);
                safeLocalStorage.setItem('authUser', JSON.stringify(userData));
                setToken(receivedToken);
                setUser(userData);

                console.log('[AuthContext] Login successful for user:', userData.email);
                return { success: true, user: userData };
            } else {
                console.error('[AuthContext] Invalid response format:', response.data);
                return { success: false, message: 'Invalid response from server' };
            }
        } catch (error) {
            console.error('[AuthContext] Login error:', error);

            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                console.error('  Status:', error.response.status);
                console.error('  Data:', error.response.data);

                return {
                    success: false,
                    message: error.response.data?.message || 'Login failed. Please check your credentials.'
                };
            } else if (error.request) {
                // Request was made but no response received
                console.error('  No response received:', error.request);
                return {
                    success: false,
                    message: 'Unable to connect to server. Please check your internet connection.'
                };
            } else {
                // Something happened in setting up the request
                console.error('  Error message:', error.message);
                return {
                    success: false,
                    message: 'An unexpected error occurred during login.'
                };
            }
        }
    };

    // Original Login Function (Uses API) - commented out for development
    /*
    const loginWithAPI = async (email, password) => {
        try {
            console.log(`[AuthContext] Making login request to ${api.defaults.baseURL}/auth/login`);
            // Use the api instance
            const response = await api.post('/auth/login', { email, password }); // Use email
            console.log('[AuthContext] Raw login response:', response);

            if (response.data && response.data.token) {
                const { token: receivedToken, user: userData } = response.data;
                safeLocalStorage.setItem('authToken', receivedToken);
                safeLocalStorage.setItem('authUser', JSON.stringify(userData));
                setToken(receivedToken);

                // Fetch subscription status immediately after getting user data
                let finalUserData = userData;
                if (userData.restaurant_id) {
                    try {
                        console.log(`[AuthContext] Fetching subscription status for restaurant ID: ${userData.restaurant_id}`);
                        const subRes = await api.get('/subscription/status'); // Uses token from interceptor
                        if (subRes.data && subRes.data.subscription) {
                            // Add subscription details to the user object
                            finalUserData = { ...userData, subscription: subRes.data.subscription };
                            console.log("[AuthContext] Subscription data fetched:", subRes.data.subscription);
                        } else {
                             console.warn("[AuthContext] No subscription data found in response for restaurant:", userData.restaurant_id);
                             finalUserData = { ...userData, subscription: null }; // Explicitly set to null
                        }
                    } catch (subError) {
                        console.error("[AuthContext] Failed to fetch subscription status during login:", subError);
                        // Proceed without subscription data, maybe show error later
                        finalUserData = { ...userData, subscription: null };
                    }
                } else {
                     console.log("[AuthContext] No restaurant_id found for user, skipping subscription fetch.");
                     finalUserData = { ...userData, subscription: null };
                }

                // Store potentially augmented user data
                safeLocalStorage.setItem('authUser', JSON.stringify(finalUserData));
                setUser(finalUserData);

                console.log("[AuthContext] Login successful, token and user (with subscription) stored.");
                return { success: true };
            } else {
                console.error('[AuthContext] No token received in response:', response.data);
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('[AuthContext] Login error:');
            if (error.response) {
                // Server responded with a status code outside of 2xx range
                console.error('  Status:', error.response.status);
                console.error('  Data:', error.response.data);
                console.error('  Headers:', error.response.headers);
            } else if (error.request) {
                // Request was made but no response received
                console.error('  No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('  Error message:', error.message);
            }
            console.error('  Error config:', error.config);

            logout(); // Ensure clean state on login failure
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please check your credentials and ensure the server is running.'
            };
        }
    };
    */

    // Production Signup Function (Uses Real API)
    const signup = async (email, password) => {
        try {
            console.log(`[AuthContext] Making signup request to ${api.defaults.baseURL}/auth/register`);

            // Use the api instance to call the real backend
            const response = await api.post('/auth/register', { email, password });
            console.log('[AuthContext] Raw signup response:', response);

            if (response.data && response.data.success) {
                console.log('[AuthContext] Signup successful for user:', email);
                return {
                    success: true,
                    message: response.data.message || 'Registration successful! Please log in.'
                };
            } else {
                console.error('[AuthContext] Invalid signup response format:', response.data);
                return {
                    success: false,
                    message: response.data?.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('[AuthContext] Signup error:', error);

            // Handle different types of errors
            if (error.response) {
                // Server responded with error status
                console.error('  Status:', error.response.status);
                console.error('  Data:', error.response.data);

                return {
                    success: false,
                    message: error.response.data?.message || 'Registration failed. Please try again.'
                };
            } else if (error.request) {
                // Request was made but no response received
                console.error('  No response received:', error.request);
                return {
                    success: false,
                    message: 'Unable to connect to server. Please check your internet connection.'
                };
            } else {
                // Something happened in setting up the request
                console.error('  Error message:', error.message);
                return {
                    success: false,
                    message: 'An unexpected error occurred during registration.'
                };
            }
        }
    };

    const logout = () => {
        safeLocalStorage.removeItem('authToken');
        safeLocalStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        // Axios interceptor will handle removing header on next request
        console.log("User logged out.");
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading, // Use isLoading
        login,
        signup,
        logout,
    };

    // Don't render children until isLoading is complete to avoid state flashes
    if (isLoading) { // Use isLoading
        return <div className="flex justify-center items-center h-screen">Loading authentication state...</div>; // Added basic centering
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

// Custom hook to use the auth context
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
