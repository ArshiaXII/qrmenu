import React, { useState } from 'react';
import menuService from '../../services/menuService';

const StorageDebugger = () => {
  const [storageData, setStorageData] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [debugError, setDebugError] = useState(null);

  // Safe wrapper for menuService calls
  const safeMenuServiceCall = (methodName, ...args) => {
    try {
      console.log(`🔧 [StorageDebugger] Attempting to call menuService.${methodName}...`);
      console.log(`🔧 [StorageDebugger] menuService type:`, typeof menuService);
      console.log(`🔧 [StorageDebugger] menuService constructor:`, menuService?.constructor?.name);
      
      if (!menuService || typeof menuService[methodName] !== 'function') {
        throw new Error(`MenuService method ${methodName} not available`);
      }
      
      const result = menuService[methodName](...args);
      console.log(`✅ [StorageDebugger] menuService.${methodName} succeeded:`, result);
      return result;
    } catch (error) {
      console.error(`❌ [StorageDebugger] menuService.${methodName} failed:`, error);
      setDebugError(`MenuService Error: ${error.message}`);
      throw error;
    }
  };

  const inspectStorage = () => {
    try {
      setDebugError(null);
      
      // Get storage data directly
      const rawStorageData = localStorage.getItem('qr_menu_data');
      const parsedStorageData = rawStorageData ? JSON.parse(rawStorageData) : null;
      setStorageData(parsedStorageData);

      // Get auth user directly
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
    } catch (error) {
      console.error('❌ [StorageDebugger] Error in inspectStorage:', error);
      setDebugError(`Inspect Error: ${error.message}`);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.removeItem('qr_menu_data');
      localStorage.removeItem('authUser');
      setStorageData(null);
      setAuthUser(null);
      setDiagnosticsResult(null);
      setDebugError(null);
      console.log('🔍 [StorageDebugger] Storage cleared');
    } catch (error) {
      console.error('❌ [StorageDebugger] Error clearing storage:', error);
      setDebugError(`Clear Error: ${error.message}`);
    }
  };

  const fixSlugMismatch = () => {
    try {
      setDebugError(null);
      console.log('🔧 [StorageDebugger] Calling fixSlugMismatch...');
      const result = safeMenuServiceCall('fixSlugMismatch');
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

  const runComprehensiveDiagnostics = () => {
    try {
      setDebugError(null);
      console.log('🧪 [StorageDebugger] === COMPREHENSIVE DIAGNOSTICS ===');

      const result = {
        timestamp: new Date().toISOString(),
        menuServiceTest: null,
        slugAnalysis: null,
        authAnalysis: null,
        storageAnalysis: null,
        publicAccessTest: null
      };

      // Test 1: MenuService functionality
      console.log('🧪 [Test 1] Testing MenuService functionality...');
      try {
        // Test that menuService is accessible and functional
        console.log('🧪 [Test 1] menuService type:', typeof menuService);
        console.log('🧪 [Test 1] menuService constructor:', menuService?.constructor?.name);
        console.log('🧪 [Test 1] menuService available methods:', menuService ? Object.getOwnPropertyNames(Object.getPrototypeOf(menuService)) : 'NOT AVAILABLE');

        // Test a simple method call safely
        const userSlug = safeMenuServiceCall('getCurrentUserRestaurantSlug');
        console.log('🧪 [Test 1] getCurrentUserRestaurantSlug result:', userSlug);

        result.menuServiceTest = {
          success: true,
          type: typeof menuService,
          constructorName: menuService?.constructor?.name,
          userSlug: userSlug,
          isAvailable: !!menuService
        };
        console.log('✅ [Test 1] MenuService test PASSED');
      } catch (error) {
        console.error('❌ [Test 1] MenuService test FAILED:', error);
        result.menuServiceTest = {
          success: false,
          error: error.message,
          stack: error.stack,
          isAvailable: !!menuService
        };
      }

      // Test 2: Auth Analysis
      console.log('🧪 [Test 2] Analyzing authentication...');
      try {
        const authUser = localStorage.getItem('authUser');
        const parsedAuthUser = authUser ? JSON.parse(authUser) : null;

        result.authAnalysis = {
          hasAuthUser: !!authUser,
          authUser: parsedAuthUser,
          restaurantId: parsedAuthUser?.restaurant_id,
          expectedSlug: parsedAuthUser?.restaurant_id ? `restaurant-${parsedAuthUser.restaurant_id}` : null
        };
        console.log('✅ [Test 2] Auth analysis completed:', result.authAnalysis);
      } catch (error) {
        console.error('❌ [Test 2] Auth analysis FAILED:', error);
        result.authAnalysis = { error: error.message };
      }

      // Test 3: Storage Analysis
      console.log('🧪 [Test 3] Analyzing storage data...');
      try {
        const storageData = JSON.parse(localStorage.getItem('qr_menu_data') || '{"restaurants":{}}');
        const availableSlugs = Object.keys(storageData.restaurants);

        result.storageAnalysis = {
          hasStorageData: !!localStorage.getItem('qr_menu_data'),
          availableSlugs: availableSlugs,
          restaurantCount: availableSlugs.length,
          restaurants: {}
        };

        availableSlugs.forEach(slug => {
          const data = storageData.restaurants[slug];
          result.storageAnalysis.restaurants[slug] = {
            restaurantName: data.restaurant?.name,
            restaurantSlug: data.restaurant?.slug,
            isActive: data.restaurant?.isActive,
            hasMenu: !!data.menu,
            menuSections: data.menu?.sections?.length || 0
          };
        });

        console.log('✅ [Test 3] Storage analysis completed:', result.storageAnalysis);
      } catch (error) {
        console.error('❌ [Test 3] Storage analysis FAILED:', error);
        result.storageAnalysis = { error: error.message };
      }

      // Test 4: Slug Cross-Reference Analysis
      console.log('🧪 [Test 4] Analyzing slug matching...');
      try {
        const expectedSlug = result.authAnalysis?.expectedSlug;
        const availableSlugs = result.storageAnalysis?.availableSlugs || [];

        result.slugAnalysis = {
          expectedSlug: expectedSlug,
          directMatch: expectedSlug ? availableSlugs.includes(expectedSlug) : false,
          crossReferences: []
        };

        if (expectedSlug && !result.slugAnalysis.directMatch) {
          // Check for cross-references
          availableSlugs.forEach(slug => {
            const data = JSON.parse(localStorage.getItem('qr_menu_data')).restaurants[slug];
            if (data.restaurant?.slug === expectedSlug) {
              result.slugAnalysis.crossReferences.push({
                storageSlug: slug,
                restaurantSlug: data.restaurant.slug,
                match: true
              });
            }
          });
        }

        console.log('✅ [Test 4] Slug analysis completed:', result.slugAnalysis);
      } catch (error) {
        console.error('❌ [Test 4] Slug analysis FAILED:', error);
        result.slugAnalysis = { error: error.message };
      }

      // Test 5: Public Access Test (only if MenuService is working)
      console.log('🧪 [Test 5] Testing public access...');
      const expectedSlug = result.authAnalysis?.expectedSlug;
      if (expectedSlug && result.menuServiceTest?.success) {
        try {
          const publicAccessPromise = safeMenuServiceCall('getPublicMenuData', expectedSlug);
          
          if (publicAccessPromise && typeof publicAccessPromise.then === 'function') {
            publicAccessPromise
              .then(data => {
                console.log('✅ [Test 5] Public access test PASSED:', data);
                result.publicAccessTest = {
                  success: true,
                  restaurantName: data.restaurant?.name,
                  isActive: data.restaurant?.isActive,
                  menuSections: data.menu?.sections?.length || 0
                };
                
                setDiagnosticsResult(result);
                console.log('🧪 [FINAL] Comprehensive diagnostics completed:', result);
                alert('✅ Comprehensive diagnostics completed! Check console for detailed results.');
              })
              .catch(error => {
                console.error('❌ [Test 5] Public access test FAILED:', error);
                result.publicAccessTest = {
                  success: false,
                  error: error.message
                };
                
                setDiagnosticsResult(result);
                console.log('🧪 [FINAL] Comprehensive diagnostics completed with errors:', result);
                alert(`❌ Diagnostics completed with errors. Check console for details.\n\nPublic Access Error: ${error.message}`);
              });
          } else {
            throw new Error('getPublicMenuData did not return a promise');
          }
        } catch (error) {
          console.error('❌ [Test 5] Public access test setup FAILED:', error);
          result.publicAccessTest = {
            success: false,
            error: error.message
          };
          
          setDiagnosticsResult(result);
          console.log('🧪 [FINAL] Comprehensive diagnostics completed with setup error:', result);
          alert(`❌ Diagnostics completed with setup error: ${error.message}`);
        }
      } else {
        console.log('⚠️ [Test 5] Skipping public access test - no expected slug found or MenuService failed');
        result.publicAccessTest = {
          success: false,
          error: result.menuServiceTest?.success ? 'No expected slug found' : 'MenuService not functional'
        };
        
        setDiagnosticsResult(result);
        console.log('🧪 [FINAL] Comprehensive diagnostics completed:', result);
        alert('⚠️ Diagnostics completed but public access test was skipped.');
      }

    } catch (error) {
      console.error('❌ [StorageDebugger] Error in comprehensive diagnostics:', error);
      setDebugError(`Diagnostics Error: ${error.message}`);
      alert('❌ Error running diagnostics: ' + error.message);
    }
  };

  const testPublicAccess = () => {
    try {
      setDebugError(null);
      console.log('🧪 [StorageDebugger] === COMPREHENSIVE PUBLIC ACCESS TEST ===');

      // Step 1: Get current user slug safely
      let currentSlug;
      try {
        currentSlug = safeMenuServiceCall('getCurrentUserRestaurantSlug');
        console.log('🧪 [StorageDebugger] Current user slug:', currentSlug);
      } catch (error) {
        console.error('❌ [StorageDebugger] Failed to get current user slug:', error);
        alert('❌ Cannot get current user slug: ' + error.message);
        return;
      }

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

        // Test the public data access safely
        try {
          const publicAccessPromise = safeMenuServiceCall('getPublicMenuData', currentSlug);
          
          if (publicAccessPromise && typeof publicAccessPromise.then === 'function') {
            publicAccessPromise
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
            console.error('❌ [StorageDebugger] getPublicMenuData did not return a promise');
            alert('❌ getPublicMenuData did not return a promise. Check console for details.');
          }
        } catch (error) {
          console.error('❌ [StorageDebugger] Error calling getPublicMenuData:', error);
          alert('❌ Error calling getPublicMenuData: ' + error.message);
        }
      } else {
        console.error('❌ [StorageDebugger] No current user slug found');
        alert('❌ No current user slug found');
      }
    } catch (error) {
      console.error('❌ [StorageDebugger] Error in testPublicAccess:', error);
      setDebugError(`Test Public Access Error: ${error.message}`);
      alert('❌ Error testing public access: ' + error.message);
    }
  };

  const generateQRTestURL = () => {
    try {
      setDebugError(null);
      
      let currentSlug;
      try {
        currentSlug = safeMenuServiceCall('getCurrentUserRestaurantSlug');
      } catch (error) {
        console.error('❌ [StorageDebugger] Failed to get current user slug for QR URL:', error);
        alert('❌ Cannot generate QR URL - failed to get restaurant slug: ' + error.message);
        return;
      }

      if (currentSlug) {
        // Use the current environment - in production this would be the server IP
        const baseURL = window.location.hostname === 'localhost' 
          ? 'http://localhost:3000' 
          : `http://${window.location.hostname}`;
        const qrURL = `${baseURL}/menu/${currentSlug}`;
        
        console.log('🔗 [StorageDebugger] Generated QR URL:', qrURL);
        
        // Safe clipboard handling with fallback for HTTP environments
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(qrURL).then(() => {
            alert(`✅ QR URL copied to clipboard:\n\n${qrURL}\n\nOpen this URL in a new tab or mobile browser to test.`);
          }).catch((clipboardError) => {
            console.warn('⚠️ [StorageDebugger] Clipboard API failed:', clipboardError);
            // Fallback for clipboard failure
            alert(`📋 QR URL (clipboard unavailable):\n\n${qrURL}\n\nPlease copy this URL manually and test it.`);
          });
        } else {
          // Fallback for environments without clipboard API (HTTP, older browsers)
          console.warn('⚠️ [StorageDebugger] Clipboard API not available (likely HTTP environment)');
          alert(`📋 QR URL (clipboard unavailable on HTTP):\n\n${qrURL}\n\nPlease copy this URL manually and test it.\n\nNote: Clipboard API requires HTTPS for security.`);
        }
      } else {
        alert('❌ Cannot generate QR URL - no restaurant slug found');
      }
    } catch (error) {
      console.error('❌ [StorageDebugger] Error generating QR URL:', error);
      setDebugError(`QR URL Error: ${error.message}`);
      alert('❌ Error generating QR URL: ' + error.message);
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
      maxWidth: '450px',
      fontSize: '12px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#8b5cf6' }}>🔍 Enhanced Storage Debugger v2</h3>
      
      {debugError && (
        <div style={{ marginBottom: '10px', padding: '8px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '10px' }}>
          <strong>🚨 Error:</strong><br/>
          {debugError}
          <br/>
          <small style={{ color: '#666' }}>Check console for detailed logs</small>
        </div>
      )}
      
      <div style={{ marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        <button 
          onClick={inspectStorage}
          style={{ 
            background: '#8b5cf6', 
            color: 'white', 
            border: 'none', 
            padding: '5px 8px', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
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
            padding: '5px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
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
            padding: '5px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
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
            padding: '5px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Test Public Access
        </button>
        <button
          onClick={runComprehensiveDiagnostics}
          style={{
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Full Diagnostics
        </button>
        <button
          onClick={generateQRTestURL}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '5px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          Get QR URL
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
        <div style={{ marginBottom: '10px', padding: '8px', background: '#f3f4f6', borderRadius: '4px' }}>
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

      {diagnosticsResult && (
        <div style={{ marginTop: '10px', padding: '8px', background: '#e0f2fe', borderRadius: '4px', fontSize: '10px' }}>
          <strong>🧪 Diagnostics Result:</strong><br/>
          MenuService: {diagnosticsResult.menuServiceTest?.success ? '✅' : '❌'}<br/>
          Auth: {diagnosticsResult.authAnalysis?.hasAuthUser ? '✅' : '❌'}<br/>
          Storage: {diagnosticsResult.storageAnalysis?.restaurantCount > 0 ? '✅' : '❌'}<br/>
          Slug Match: {diagnosticsResult.slugAnalysis?.directMatch || diagnosticsResult.slugAnalysis?.crossReferences?.length > 0 ? '✅' : '❌'}<br/>
          Public Access: {diagnosticsResult.publicAccessTest?.success ? '✅' : '❌'}<br/>
          <small style={{ color: '#666' }}>Check console for detailed logs</small>
        </div>
      )}
    </div>
  );
};

export default StorageDebugger;
