import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import menuService from '../../services/menuService';

const OnboardingTest = () => {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const addResult = (category, type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { 
      id: Date.now(), 
      category, 
      type, 
      message, 
      data: data ? JSON.stringify(data, null, 2) : null,
      timestamp 
    }]);
  };

  const clearResults = () => setResults([]);

  const testCurrentState = () => {
    addResult('Current State', 'info', 'Checking current onboarding state...');
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
      const restaurantData = menuService.getCurrentUserRestaurant();
      
      addResult('Current State', 'info', `Current user: ${JSON.stringify(currentUser)}`);
      addResult('Current State', 'info', `Restaurant data: ${JSON.stringify(restaurantData)}`);
      
      if (restaurantData) {
        const onboardingStatus = restaurantData.onboarding_completed;
        addResult('Current State', onboardingStatus ? 'success' : 'warning', 
          `Onboarding completed: ${onboardingStatus}`);
      } else {
        addResult('Current State', 'error', 'No restaurant data found');
      }
    } catch (error) {
      addResult('Current State', 'error', `Error: ${error.message}`);
    }
  };

  const completeOnboarding = () => {
    addResult('Complete Onboarding', 'info', 'Manually completing onboarding...');
    
    try {
      const currentRestaurant = menuService.getCurrentUserRestaurant();
      
      if (currentRestaurant) {
        const storageData = menuService.getStorageData();
        const restaurantSlug = currentRestaurant.slug;
        
        if (storageData.restaurants[restaurantSlug]) {
          storageData.restaurants[restaurantSlug].restaurant.onboarding_completed = true;
          menuService.saveStorageData(storageData);
          addResult('Complete Onboarding', 'success', 'Onboarding marked as completed');
          
          // Test the updated state
          const updatedData = menuService.getCurrentUserRestaurant();
          addResult('Complete Onboarding', 'success', 
            `Updated onboarding status: ${updatedData.onboarding_completed}`);
        } else {
          addResult('Complete Onboarding', 'error', 'Restaurant data not found in storage');
        }
      } else {
        addResult('Complete Onboarding', 'error', 'No current restaurant found');
      }
    } catch (error) {
      addResult('Complete Onboarding', 'error', `Error: ${error.message}`);
    }
  };

  const resetOnboarding = () => {
    addResult('Reset Onboarding', 'info', 'Resetting onboarding status...');
    
    try {
      const currentRestaurant = menuService.getCurrentUserRestaurant();
      
      if (currentRestaurant) {
        const storageData = menuService.getStorageData();
        const restaurantSlug = currentRestaurant.slug;
        
        if (storageData.restaurants[restaurantSlug]) {
          storageData.restaurants[restaurantSlug].restaurant.onboarding_completed = false;
          menuService.saveStorageData(storageData);
          addResult('Reset Onboarding', 'success', 'Onboarding reset to incomplete');
        }
      }
    } catch (error) {
      addResult('Reset Onboarding', 'error', `Error: ${error.message}`);
    }
  };

  const navigateToDashboard = () => {
    addResult('Navigation', 'info', 'Attempting to navigate to dashboard...');
    navigate('/dashboard/overview');
  };

  const refreshPage = () => {
    addResult('Refresh', 'info', 'Refreshing page...');
    window.location.reload();
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        🧪 Onboarding Debug Test
      </h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={testCurrentState}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#6b7280', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Check Current State
        </button>
        
        <button 
          onClick={completeOnboarding}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Complete Onboarding
        </button>
        
        <button 
          onClick={resetOnboarding}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#f59e0b', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Reset Onboarding
        </button>
        
        <button 
          onClick={navigateToDashboard}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go to Dashboard
        </button>
        
        <button 
          onClick={refreshPage}
          style={{ 
            padding: '0.75rem 1.5rem', 
            background: '#8b5cf6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Refresh Page
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

      <div style={{ 
        background: '#f9fafb', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px', 
        padding: '1.5rem',
        maxHeight: '600px',
        overflowY: 'auto'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          Test Results:
        </h2>
        
        {results.length === 0 ? (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
            No test results yet. Click a button above to start testing.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {results.map(result => (
              <div 
                key={result.id}
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: '6px',
                  background: result.type === 'success' ? '#d1fae5' : 
                             result.type === 'error' ? '#fee2e2' : 
                             result.type === 'warning' ? '#fef3c7' : '#e0f2fe',
                  border: `1px solid ${result.type === 'success' ? '#10b981' : 
                                      result.type === 'error' ? '#ef4444' : 
                                      result.type === 'warning' ? '#f59e0b' : '#3b82f6'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      [{result.category}]
                    </span>
                    <span style={{ marginLeft: '0.5rem' }}>
                      {result.message}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {result.timestamp}
                  </span>
                </div>
                {result.data && (
                  <pre style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.75rem', 
                    background: 'rgba(0,0,0,0.05)', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {result.data}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingTest;
