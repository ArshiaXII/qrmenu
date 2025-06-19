import React, { useState, useEffect } from 'react';
import MenuListingPage from './MenuListingPage';
import EnhancedMenuEditor from './EnhancedMenuEditor';
import api from '../../services/api';

const MenuManagementDashboard = () => {
  const [currentView, setCurrentView] = useState('listing'); // 'listing' or 'editing'
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      // Use the existing restaurant endpoint
      const response = await api.get('/restaurants/me');
      setRestaurantData(response.data.restaurant);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      // Continue without restaurant data for now
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setCurrentView('editing');
  };

  const handleCreateMenu = (menu) => {
    // Optionally navigate to edit the newly created menu
    setSelectedMenu(menu);
    setCurrentView('editing');
  };

  const handleBackToListing = () => {
    setSelectedMenu(null);
    setCurrentView('listing');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView === 'listing' ? (
        <MenuListingPage
          onEditMenu={handleEditMenu}
          onCreateMenu={handleCreateMenu}
          restaurantData={restaurantData}
        />
      ) : (
        <EnhancedMenuEditor
          menu={selectedMenu}
          onBack={handleBackToListing}
          restaurantData={restaurantData}
        />
      )}
    </div>
  );
};

export default MenuManagementDashboard;
