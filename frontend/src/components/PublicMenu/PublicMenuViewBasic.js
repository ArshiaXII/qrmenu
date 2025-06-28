import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import menuService from '../../services/menuServiceSimple';
import './PublicMenuView.css';

const PublicMenuView = () => {
  const { restaurantSlug } = useParams();
  
  // State management
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load menu data when component mounts
  useEffect(() => {
    console.log('🔍 [PublicMenuView] useEffect triggered');
    console.log('🔍 [PublicMenuView] restaurantSlug from URL:', restaurantSlug);
    
    const loadMenuData = async () => {
      console.log('🔍 [PublicMenuView] Starting loadMenuData...');
      
      // Step 1: Check if we have a slug
      if (!restaurantSlug) {
        console.log('❌ [PublicMenuView] No restaurant slug provided');
        setError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('🔍 [PublicMenuView] Calling menuService.getPublicMenuData with slug:', restaurantSlug);
        
        // Step 2: Call the simple getPublicMenuData function
        const data = await menuService.getPublicMenuData(restaurantSlug);
        console.log('🔍 [PublicMenuView] Result from menuService:', data);
        
        // Step 3: Handle the result
        if (data) {
          console.log('✅ [PublicMenuView] Menu data received successfully');
          console.log('🔍 [PublicMenuView] Restaurant name:', data.restaurant?.name);
          console.log('🔍 [PublicMenuView] Menu sections:', data.menu?.sections?.length || 0);
          setMenuData(data);
          setError(false);
        } else {
          console.log('❌ [PublicMenuView] No menu data received (restaurant not found or not active)');
          setError(true);
        }
        
      } catch (error) {
        console.error('❌ [PublicMenuView] Error loading menu data:', error);
        setError(true);
      } finally {
        console.log('🔍 [PublicMenuView] Setting loading to false');
        setIsLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantSlug]);

  // Loading state
  if (isLoading) {
    console.log('🔍 [PublicMenuView] Rendering loading state');
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Error state (menu unavailable)
  if (error || !menuData) {
    console.log('🔍 [PublicMenuView] Rendering error state');
    return (
      <div className="public-menu-unavailable">
        <div className="unavailable-content">
          <h1>Menu is currently unavailable</h1>
          <p>This restaurant menu is not available at the moment.</p>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  // Success state - render menu
  console.log('🔍 [PublicMenuView] Rendering menu data');
  console.log('🔍 [PublicMenuView] Final menuData:', menuData);

  return (
    <div className="public-menu-view">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <h1 className="restaurant-name">
          {menuData.restaurant?.name || 'Restaurant'}
        </h1>
        {menuData.restaurant?.address && (
          <p className="restaurant-address">{menuData.restaurant.address}</p>
        )}
        {menuData.restaurant?.phone && (
          <p className="restaurant-phone">{menuData.restaurant.phone}</p>
        )}
        {menuData.restaurant?.hours && (
          <p className="restaurant-hours">{menuData.restaurant.hours}</p>
        )}
      </div>

      {/* Menu Content */}
      <div className="menu-content">
        {menuData.menu && menuData.menu.sections && menuData.menu.sections.length > 0 ? (
          menuData.menu.sections.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className="menu-section">
              <h2 className="section-title">
                {section.name || section.title || `Section ${sectionIndex + 1}`}
              </h2>
              
              {section.items && section.items.length > 0 ? (
                <div className="menu-items">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id || itemIndex} className="menu-item">
                      <div className="item-content">
                        <div className="item-info">
                          <h3 className="item-name">
                            {item.name || item.title?.tr || item.title?.en || item.title || 'No title'}
                          </h3>
                          {(item.description || item.description?.tr || item.description?.en) && (
                            <p className="item-description">
                              {item.description || item.description?.tr || item.description?.en}
                            </p>
                          )}
                        </div>
                        <div className="item-price">
                          {item.price && (
                            <span className="price">₺{item.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No items in this section.</p>
              )}
            </div>
          ))
        ) : (
          <div className="no-menu">
            <p>No menu available.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="menu-footer">
        <p>Digital Menu</p>
      </div>
    </div>
  );
};

export default PublicMenuView;
