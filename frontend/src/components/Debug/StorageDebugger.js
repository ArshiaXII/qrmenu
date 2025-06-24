import React, { useState } from 'react';

const StorageDebugger = () => {
  const [storageData, setStorageData] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  const inspectStorage = () => {
    // Get storage data
    const rawStorageData = localStorage.getItem('qr_menu_data');
    const parsedStorageData = rawStorageData ? JSON.parse(rawStorageData) : null;
    setStorageData(parsedStorageData);

    // Get auth user
    const rawAuthUser = localStorage.getItem('authUser');
    const parsedAuthUser = rawAuthUser ? JSON.parse(rawAuthUser) : null;
    setAuthUser(parsedAuthUser);

    // Console logs for debugging
    console.log('🔍 [StorageDebugger] Raw storage data:', rawStorageData);
    console.log('🔍 [StorageDebugger] Parsed storage data:', parsedStorageData);
    console.log('🔍 [StorageDebugger] Raw auth user:', rawAuthUser);
    console.log('🔍 [StorageDebugger] Parsed auth user:', parsedAuthUser);

    if (parsedAuthUser?.restaurant_id) {
      const expectedSlug = `restaurant-${parsedAuthUser.restaurant_id}`;
      console.log('🔍 [StorageDebugger] Expected slug:', expectedSlug);
      console.log('🔍 [StorageDebugger] Slug exists in storage:', !!parsedStorageData?.restaurants?.[expectedSlug]);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('qr_menu_data');
    localStorage.removeItem('authUser');
    setStorageData(null);
    setAuthUser(null);
    console.log('🔍 [StorageDebugger] Storage cleared');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #8b5cf6', 
      padding: '15px', 
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🔍 Storage Debugger</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={inspectStorage}
          style={{ 
            background: '#8b5cf6', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            borderRadius: '4px',
            marginRight: '5px',
            cursor: 'pointer'
          }}
        >
          Inspect Storage
        </button>
        <button 
          onClick={clearStorage}
          style={{ 
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            padding: '5px 10px', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear Storage
        </button>
      </div>

      {authUser && (
        <div style={{ marginBottom: '10px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
          <strong>Auth User:</strong><br/>
          Email: {authUser.email}<br/>
          Restaurant ID: {authUser.restaurant_id}<br/>
          Expected Slug: restaurant-{authUser.restaurant_id}
        </div>
      )}

      {storageData && (
        <div style={{ padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
          <strong>Storage Data:</strong><br/>
          Available Slugs: {Object.keys(storageData.restaurants || {}).join(', ') || 'None'}<br/>
          <br/>
          {Object.keys(storageData.restaurants || {}).map(slug => {
            const restaurant = storageData.restaurants[slug];
            return (
              <div key={slug} style={{ marginBottom: '5px', padding: '5px', background: 'white', borderRadius: '3px' }}>
                <strong>{slug}:</strong><br/>
                Name: {restaurant.restaurant?.name}<br/>
                Active: {restaurant.restaurant?.isActive ? 'Yes' : 'No'}<br/>
                Slug: {restaurant.restaurant?.slug}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StorageDebugger;
