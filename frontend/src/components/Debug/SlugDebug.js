import React, { useState, useEffect } from 'react';
import { menuService } from '../../services/menuService';

const SlugDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [newRestaurantName, setNewRestaurantName] = useState('');

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = () => {
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      
      // Get all storage data
      const storageData = menuService.getStorageData();
      
      // Get current restaurant
      const currentRestaurant = menuService.getCurrentUserRestaurant();
      
      // Get current slug
      const currentSlug = menuService.getCurrentUserRestaurantSlug();

      setDebugInfo({
        currentUser,
        storageData,
        currentRestaurant,
        currentSlug,
        availableSlugs: Object.keys(storageData.restaurants || {}),
        restaurantCount: Object.keys(storageData.restaurants || {}).length
      });
    } catch (error) {
      console.error('Error loading debug info:', error);
      setDebugInfo({ error: error.message });
    }
  };

  const generateSlugFromName = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const fixRestaurantSlug = async () => {
    if (!newRestaurantName.trim()) {
      alert('Please enter a restaurant name');
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const newSlug = generateSlugFromName(newRestaurantName);
      
      console.log('Fixing restaurant slug...');
      console.log('New name:', newRestaurantName);
      console.log('New slug:', newSlug);

      // Get current storage data
      const storageData = menuService.getStorageData();
      
      // Find current user's restaurant data
      let oldSlug = null;
      let restaurantData = null;
      
      for (const [slug, data] of Object.entries(storageData.restaurants || {})) {
        if (data.restaurant && data.restaurant.userId === currentUser.id) {
          oldSlug = slug;
          restaurantData = data;
          break;
        }
      }

      if (oldSlug && restaurantData) {
        // Remove old entry
        delete storageData.restaurants[oldSlug];
        
        // Update restaurant name and create new entry with correct slug
        restaurantData.restaurant.name = newRestaurantName;
        restaurantData.restaurant.slug = newSlug;
        storageData.restaurants[newSlug] = restaurantData;
        
        // Update user's restaurantSlug
        currentUser.restaurantSlug = newSlug;
        localStorage.setItem('authUser', JSON.stringify(currentUser));
        
        // Save updated storage data
        menuService.saveStorageData(storageData);
        
        console.log('✅ Restaurant slug fixed!');
        console.log('Old slug:', oldSlug);
        console.log('New slug:', newSlug);
        
        // Reload debug info
        loadDebugInfo();
        
        alert(`Restaurant slug updated successfully!\nOld: ${oldSlug}\nNew: ${newSlug}\n\nYour menu is now available at: /menu/${newSlug}`);
      } else {
        alert('No restaurant data found for current user');
      }
    } catch (error) {
      console.error('Error fixing slug:', error);
      alert('Error fixing slug: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h2>🔧 Restaurant Slug Debug Tool</h2>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h3>Fix Restaurant Slug</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>Enter your actual restaurant name:</label>
          <br />
          <input
            type="text"
            value={newRestaurantName}
            onChange={(e) => setNewRestaurantName(e.target.value)}
            placeholder="e.g., Güzel Kebapçı"
            style={{ padding: '8px', width: '300px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Generated slug preview:</strong> {newRestaurantName ? generateSlugFromName(newRestaurantName) : '(enter name above)'}
        </div>
        <button 
          onClick={fixRestaurantSlug}
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Fix Restaurant Slug
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={loadDebugInfo}
          style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Refresh Debug Info
        </button>
      </div>

      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
        <h3>Current Debug Information:</h3>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SlugDebug;
