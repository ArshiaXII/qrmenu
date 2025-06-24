import React, { useState } from 'react';
import menuService from '../../services/menuService';

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

  const fixSlugMismatch = () => {
    try {
      console.log('🔧 [StorageDebugger] Calling fixSlugMismatch...');
      const result = menuService.fixSlugMismatch();
      if (result) {
        console.log('✅ [StorageDebugger] Slug mismatch fixed');
        // Refresh the display
        inspectStorage();
      } else {
        console.error('❌ [StorageDebugger] Failed to fix slug mismatch');
      }
    } catch (error) {
      console.error('❌ [StorageDebugger] Error in fixSlugMismatch:', error);
      alert('❌ Error fixing slug mismatch: ' + error.message);
    }
  };

  const testPublicAccess = () => {
    try {
      console.log('🧪 [StorageDebugger] === COMPREHENSIVE PUBLIC ACCESS TEST ===');

      // Step 1: Get current user slug
      const currentSlug = menuService.getCurrentUserRestaurantSlug();
      console.log('🧪 [StorageDebugger] Current user slug:', currentSlug);

      // Step 2: Check storage data
      const storageData = JSON.parse(localStorage.getItem('qr_menu_data') || '{"restaurants":{}}');
      console.log('🧪 [StorageDebugger] Available slugs in storage:', Object.keys(storageData.restaurants));

      // Step 3: Check if current slug exists
      const directExists = !!storageData.restaurants[currentSlug];
      console.log('🧪 [StorageDebugger] Current slug exists directly:', directExists);

      // Step 4: Check restaurant data for each slug
      Object.keys(storageData.restaurants).forEach(slug => {
        const data = storageData.restaurants[slug];
        console.log(`🧪 [StorageDebugger] Slug "${slug}":`, {
          restaurantName: data.restaurant?.name,
          restaurantSlug: data.restaurant?.slug,
          isActive: data.restaurant?.isActive,
          hasMenu: !!data.menu,
          menuSections: data.menu?.sections?.length || 0
        });
      });

      if (currentSlug) {
        console.log('🧪 [StorageDebugger] Testing public access for slug:', currentSlug);

        // Test the public data access
        menuService.getPublicMenuData(currentSlug)
          .then(data => {
            console.log('✅ [StorageDebugger] Public access test PASSED:', data);
            console.log('✅ [StorageDebugger] Restaurant found:', data.restaurant?.name);
            console.log('✅ [StorageDebugger] Restaurant active:', data.restaurant?.isActive);
            console.log('✅ [StorageDebugger] Menu sections:', data.menu?.sections?.length || 0);
            alert('✅ Public access test PASSED! QR code should work.');
          })
          .catch(error => {
            console.error('❌ [StorageDebugger] Public access test FAILED:', error);
            console.error('❌ [StorageDebugger] Error details:', error.message);
            alert(`❌ Public access test FAILED: ${error.message}\n\nCheck console for detailed logs.`);
          });
      } else {
        console.error('❌ [StorageDebugger] No current user slug found');
        alert('❌ No current user slug found');
      }
    } catch (error) {
      console.error('❌ [StorageDebugger] Error in testPublicAccess:', error);
      alert('❌ Error testing public access: ' + error.message);
    }
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
        <button
          onClick={fixSlugMismatch}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Fix Slug Mismatch
        </button>
        <button
          onClick={testPublicAccess}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Public Access
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
