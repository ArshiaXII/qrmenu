import React, { useState } from 'react';
import menuService from '../../services/menuService';

const DataFlowTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, { test, status, message, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const forceActivateMenu = async () => {
    try {
      addResult('Force Activation', 'info', 'Forcing menu activation...');
      await menuService.updateMenuStatus('active');
      addResult('Force Activation', 'success', 'Menu has been activated! Try the public menu now.');
    } catch (error) {
      addResult('Force Activation', 'error', `Failed to activate menu: ${error.message}`);
    }
  };

  const runDataFlowTest = async () => {
    setIsRunning(true);
    clearResults();

    try {
      // Test 1: Check authentication
      addResult('Authentication', 'info', 'Checking authentication...');
      const authUser = localStorage.getItem('authUser');
      if (authUser) {
        const user = JSON.parse(authUser);
        addResult('Authentication', 'success', `User authenticated: ${user.email}`, user);
      } else {
        addResult('Authentication', 'error', 'No authenticated user found');
        setIsRunning(false);
        return;
      }

      // Test 2: Check current user restaurant slug
      addResult('Restaurant Slug', 'info', 'Getting current user restaurant slug...');
      const slug = menuService.getCurrentUserRestaurantSlug();
      if (slug) {
        addResult('Restaurant Slug', 'success', `Found slug: ${slug}`);
      } else {
        addResult('Restaurant Slug', 'error', 'No restaurant slug found');
      }

      // Test 3: Check localStorage structure
      addResult('Storage Structure', 'info', 'Checking localStorage structure...');
      const storageData = menuService.getStorageData();
      addResult('Storage Structure', 'success', `Found ${Object.keys(storageData.restaurants).length} restaurants`, storageData);

      // Test 3.1: Check raw localStorage data
      addResult('Raw Storage Check', 'info', 'Checking raw localStorage data...');
      const rawData = localStorage.getItem('qr_menu_data');
      if (rawData) {
        try {
          const parsed = JSON.parse(rawData);
          addResult('Raw Storage Check', 'success', `Raw data parsed successfully. Keys: ${Object.keys(parsed.restaurants || {}).join(', ')}`, parsed);
        } catch (error) {
          addResult('Raw Storage Check', 'error', `Failed to parse raw data: ${error.message}`);
        }
      } else {
        addResult('Raw Storage Check', 'error', 'No raw localStorage data found');
      }

      // Test 4: Get current user restaurant data
      addResult('Restaurant Data', 'info', 'Getting current user restaurant data...');
      const restaurantData = menuService.getCurrentUserRestaurant();
      if (restaurantData) {
        addResult('Restaurant Data', 'success', `Found restaurant: ${restaurantData.name}`, restaurantData);
      } else {
        addResult('Restaurant Data', 'warning', 'No restaurant data found, creating default...');
        
        // Create default restaurant data
        const user = JSON.parse(authUser);
        const defaultSlug = `restaurant-${user.id}`;
        menuService.ensureRestaurantDataExists(defaultSlug, user);
        
        const newRestaurantData = menuService.getCurrentUserRestaurant();
        if (newRestaurantData) {
          addResult('Restaurant Data', 'success', `Created default restaurant: ${newRestaurantData.name}`, newRestaurantData);
        } else {
          addResult('Restaurant Data', 'error', 'Failed to create default restaurant data');
        }
      }

      // Test 5: Test menu content save
      addResult('Menu Save Test', 'info', 'Testing menu content save...');
      const testMenuData = {
        sections: [
          {
            id: 'test-section-1',
            title: { tr: 'Test Kategori', en: 'Test Category' },
            description: { tr: 'Test açıklama', en: 'Test description' },
            items: [
              {
                id: 'test-item-1',
                title: { tr: 'Test Ürün', en: 'Test Product' },
                description: { tr: 'Test ürün açıklaması', en: 'Test product description' },
                price: 29.99,
                isAvailable: true
              }
            ]
          }
        ]
      };

      try {
        await menuService.saveMenuContent(null, testMenuData);
        addResult('Menu Save Test', 'success', 'Menu content saved successfully');
      } catch (error) {
        addResult('Menu Save Test', 'error', `Failed to save menu: ${error.message}`);
      }

      // Test 6: Test design customization save
      addResult('Design Save Test', 'info', 'Testing design customization save...');
      const testDesignData = {
        colors: {
          accentColor: '#8b5cf6',
          textColor: '#1f2937',
          backgroundColor: '#ffffff'
        },
        logo: null,
        backgroundImage: null
      };

      try {
        await menuService.saveDesignCustomization(null, testDesignData);
        addResult('Design Save Test', 'success', 'Design customization saved successfully');
      } catch (error) {
        addResult('Design Save Test', 'error', `Failed to save design: ${error.message}`);
      }

      // Test 7: Test menu status update (CRITICAL for public access)
      addResult('Status Update Test', 'info', 'Testing menu status update to ACTIVE...');
      try {
        await menuService.updateMenuStatus('active');
        addResult('Status Update Test', 'success', 'Menu status updated to active - PUBLIC MENU SHOULD NOW BE ACCESSIBLE');

        // Verify the status was actually set
        const verifyData = menuService.getCurrentUserRestaurant();
        if (verifyData && verifyData.status === 'active') {
          addResult('Status Verification', 'success', 'Status verification: Menu is now active');
        } else {
          addResult('Status Verification', 'warning', `Status verification: Expected 'active', got '${verifyData?.status}'`);
        }
      } catch (error) {
        addResult('Status Update Test', 'error', `Failed to update status: ${error.message}`);
      }

      // Test 8: Test public menu data retrieval
      addResult('Public Data Test', 'info', 'Testing public menu data retrieval...');
      const currentSlug = menuService.getCurrentUserRestaurantSlug();
      if (currentSlug) {
        try {
          const publicData = await menuService.getPublicMenuData(currentSlug);
          if (publicData) {
            addResult('Public Data Test', 'success', `Public menu data retrieved for slug: ${currentSlug}`, publicData);

            // Test 8.1: Verify the menu data matches what we saved
            const savedMenuData = publicData.menu;
            if (savedMenuData && savedMenuData.sections && savedMenuData.sections.length > 0) {
              const hasTestSection = savedMenuData.sections.some(section =>
                section.id === 'test-section-1' ||
                (section.title && (section.title.tr === 'Test Kategori' || section.title === 'Test Kategori'))
              );
              if (hasTestSection) {
                addResult('Menu Data Verification', 'success', 'Saved test menu data found in public menu!');
              } else {
                addResult('Menu Data Verification', 'warning', 'Test menu data not found - data might not be persisting correctly');
              }
            } else {
              addResult('Menu Data Verification', 'warning', 'No menu sections found in public data');
            }
          } else {
            addResult('Public Data Test', 'warning', 'Public menu data is null (menu might be inactive)');
          }
        } catch (error) {
          addResult('Public Data Test', 'error', `Failed to get public data: ${error.message}`);
        }
      } else {
        addResult('Public Data Test', 'error', 'No slug available for public data test');
      }

      // Test 9: Cross-verify slug consistency
      addResult('Slug Consistency Test', 'info', 'Testing slug consistency between save and retrieve...');
      const currentRestaurantData = menuService.getCurrentUserRestaurant();
      if (currentRestaurantData && currentSlug) {
        const dataSlug = currentRestaurantData.slug;
        if (dataSlug === currentSlug) {
          addResult('Slug Consistency Test', 'success', `Slug consistency verified: ${currentSlug}`);
        } else {
          addResult('Slug Consistency Test', 'error', `Slug mismatch! Save slug: ${currentSlug}, Data slug: ${dataSlug}`);
        }
      } else {
        addResult('Slug Consistency Test', 'error', 'Could not verify slug consistency');
      }

      addResult('Test Complete', 'success', 'All tests completed!');

    } catch (error) {
      addResult('Test Error', 'error', `Unexpected error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Data Flow Test</h2>
        <p className="text-gray-600 mb-6">
          This test verifies the complete data flow: Authentication → Data Save → Public Menu Display
        </p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={runDataFlowTest}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
          >
            {isRunning ? 'Running Tests...' : 'Run Data Flow Test'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Clear Results
          </button>
          <button
            onClick={() => {
              const slug = menuService.getCurrentUserRestaurantSlug();
              if (slug) {
                const publicUrl = `${window.location.origin}/menu/${slug}`;
                window.open(publicUrl, '_blank');
                addResult('Public Menu Test', 'info', `Opening public menu: ${publicUrl}`);
              } else {
                addResult('Public Menu Test', 'error', 'No restaurant slug found');
              }
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Open Public Menu
          </button>
          <button
            onClick={forceActivateMenu}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
          >
            Force Activate Menu
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index} className="border-l-4 border-gray-200 pl-4 py-2">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(result.status)}</span>
                <span className="font-medium">{result.test}</span>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              <p className={`text-sm ${getStatusColor(result.status)} ml-6`}>
                {result.message}
              </p>
              {result.data && (
                <details className="ml-6 mt-1">
                  <summary className="text-xs text-gray-500 cursor-pointer">View Data</summary>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {testResults.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Click "Run Data Flow Test" to start testing the data flow
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFlowTest;
