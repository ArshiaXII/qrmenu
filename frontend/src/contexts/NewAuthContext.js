import React, { createContext, useContext, useState, useEffect } from 'react';
import menuService from '../services/menuService';

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
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and restaurant data on app start
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // RULE 2: Load user's restaurant data
        const restaurantData = menuService.getRestaurantForUser(userData.id);
        setCurrentRestaurant(restaurantData);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('authUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const userData = {
        id: Date.now(),
        email: email,
        name: email.split('@')[0]
      };
      
      setUser(userData);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // RULE 2: Load user's restaurant data
      const restaurantData = menuService.getRestaurantForUser(userData.id);
      setCurrentRestaurant(restaurantData);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentRestaurant(null);
    localStorage.removeItem('authUser');
  };

  // Update restaurant data in context
  const updateRestaurant = (restaurantData) => {
    setCurrentRestaurant(restaurantData);
  };

  const value = {
    user,
    currentRestaurant,
    updateRestaurant,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
