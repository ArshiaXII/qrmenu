import React, { useState, useEffect } from 'react';
import { useMenu } from '../../contexts/MenuContext';

const MenuStatusTest = () => {
  const {
    currentMenu,
    currentRestaurant,
    menuStatus,
    isLoading,
    loadDashboardMenuData,
    updateMenuStatus
  } = useMenu();

  const [testResults, setTestResults] = useState([]);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  useEffect(() => {
    addResult('Component Mount', 'info', 'MenuStatusTest component mounted');
    loadDashboardMenuData()
      .then(() => {
        addResult('Data Load', 'success', 'Dashboard data loaded successfully');
      })
      .catch((error) => {
        addResult('Data Load', 'error', `Failed to load data: ${error.message}`);
      });
  }, [loadDashboardMenuData]);

  const testStatusToggle = async () => {
    addResult('Status Toggle', 'info', `Starting status toggle test. Current status: ${menuStatus}`);

    try {
      const newStatus = menuStatus === 'active' ? 'draft' : 'active';
      addResult('Status Toggle', 'info', `Attempting to change status to: ${newStatus}`);

      const result = await updateMenuStatus(newStatus);
      addResult('Status Toggle', 'success', `Status updated successfully: ${JSON.stringify(result)}`);

      // Reload data
      await loadDashboardMenuData();
      addResult('Status Toggle', 'success', 'Data reloaded after status change');

    } catch (error) {
      addResult('Status Toggle', 'error', `Status toggle failed: ${error.message}`);
      addResult('Status Toggle', 'error', `Error stack: ${error.stack}`);
    }
  };

  const testDirectMenuService = async () => {
    addResult('Direct Test', 'info', 'Testing menuService directly...');

    try {
      const menuService = await import('../../services/menuService');
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const restaurantData = menuService.default.getCurrentUserRestaurant();

      addResult('Direct Test', 'info', `Current user: ${JSON.stringify(currentUser)}`);
      addResult('Direct Test', 'info', `Restaurant data: ${JSON.stringify(restaurantData)}`);

      if (restaurantData) {
        const currentStatus = restaurantData.isActive;
        const newStatus = !currentStatus;

        addResult('Direct Test', 'info', `Current isActive: ${currentStatus}, changing to: ${newStatus}`);

        const result = await menuService.default.updateMenuStatus(null, newStatus);
        addResult('Direct Test', 'success', `Direct update result: ${JSON.stringify(result)}`);

        // Check the result
        const updatedData = menuService.default.getCurrentUserRestaurant();
        addResult('Direct Test', 'success', `Updated restaurant data: ${JSON.stringify(updatedData)}`);

      } else {
        addResult('Direct Test', 'error', 'No restaurant data found');
      }

    } catch (error) {
      addResult('Direct Test', 'error', `Direct test failed: ${error.message}`);
    }
  };

  const testPreviewMenu = () => {
    const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const restaurantSlug = currentUser.restaurantSlug || currentRestaurant?.slug;
    
    addResult('Preview Test', 'info', `Testing preview functionality`);
    addResult('Preview Test', 'info', `Current user: ${JSON.stringify(currentUser)}`);
    addResult('Preview Test', 'info', `Restaurant slug: ${restaurantSlug}`);
    addResult('Preview Test', 'info', `Current restaurant: ${JSON.stringify(currentRestaurant)}`);
    
    if (restaurantSlug) {
      const previewUrl = `/menu/${restaurantSlug}?preview=true`;
      addResult('Preview Test', 'success', `Preview URL: ${previewUrl}`);
      window.open(previewUrl, '_blank');
    } else {
      addResult('Preview Test', 'error', 'No restaurant slug available for preview');
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkLocalStorage = () => {
    const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const storageData = JSON.parse(localStorage.getItem('qr_menu_storage') || '{}');
    
    addResult('Storage Check', 'info', `Auth User: ${JSON.stringify(authUser)}`);
    addResult('Storage Check', 'info', `Storage Data Keys: ${Object.keys(storageData)}`);
    
    if (storageData.restaurants) {
      addResult('Storage Check', 'info', `Restaurant Keys: ${Object.keys(storageData.restaurants)}`);
      Object.keys(storageData.restaurants).forEach(slug => {
        const restaurant = storageData.restaurants[slug].restaurant;
        addResult('Storage Check', 'info', `${slug}: ${restaurant.name} (Active: ${restaurant.isActive})`);
      });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Menu Status Test Component</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Current State</h3>
        <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
        <p><strong>Menu Status:</strong> {menuStatus || 'Not set'}</p>
        <p><strong>Restaurant:</strong> {currentRestaurant?.name || 'Not loaded'}</p>
        <p><strong>Restaurant Slug:</strong> {currentRestaurant?.slug || 'Not set'}</p>
        <p><strong>Menu Sections:</strong> {currentMenu?.sections?.length || 0}</p>
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          onClick={testStatusToggle}
          disabled={isLoading}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#8b5cf6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          {isLoading ? 'Loading...' : 'Test Status Toggle'}
        </button>
        
        <button
          onClick={testPreviewMenu}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Test Preview Menu
        </button>

        <button
          onClick={testDirectMenuService}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Test Direct MenuService
        </button>
        
        <button 
          onClick={checkLocalStorage}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Check Storage
        </button>
        
        <button 
          onClick={clearResults}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Clear Results
        </button>
      </div>

      <div style={{ background: '#1f2937', color: '#f9fafb', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace' }}>
        <h3 style={{ color: '#f9fafb', marginTop: 0 }}>Test Results</h3>
        {testResults.length === 0 ? (
          <p>No test results yet. Click a test button to start.</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: result.status === 'success' ? '#10b981' : result.status === 'error' ? '#ef4444' : '#fbbf24' }}>
                [{result.timestamp}] {result.test}:
              </span>
              <span style={{ marginLeft: '0.5rem' }}>{result.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuStatusTest;
