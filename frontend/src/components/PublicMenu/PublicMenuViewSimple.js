import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import menuService from '../../services/menuService';
import './PublicMenuView.css';

const PublicMenuView = () => {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuUnavailable, setMenuUnavailable] = useState(false);

  // Load menu data when component mounts or restaurantSlug changes
  useEffect(() => {
    const loadMenuData = async () => {
      if (!restaurantSlug) {
        setMenuUnavailable(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        if (isPreview) {
          // For preview, load data regardless of status
          const allData = JSON.parse(localStorage.getItem('qr_menu_data') || '{}');
          const data = allData[restaurantSlug];
          
          if (data) {
            setMenuData(data);
            setMenuUnavailable(false);
          } else {
            setMenuUnavailable(true);
          }
        } else {
          // For public access, use the simple getPublicMenuData
          const data = await menuService.getPublicMenuData(restaurantSlug);
          
          if (data) {
            setMenuData(data);
            setMenuUnavailable(false);
          } else {
            setMenuUnavailable(true);
          }
        }
      } catch (error) {
        console.error('Error loading menu data:', error);
        setMenuUnavailable(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantSlug, isPreview]);

  // Loading state
  if (isLoading) {
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Menü yükleniyor...</p>
      </div>
    );
  }

  // Menu unavailable state
  if (menuUnavailable || !menuData) {
    return (
      <div className="public-menu-unavailable">
        <div className="unavailable-content">
          <h1>Menü Bulunamadı</h1>
          <p>Bu restoran menüsü şu anda mevcut değil veya yayınlanmamış.</p>
          <p>Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  // Render menu
  return (
    <div className="public-menu-view">
      {/* Restaurant Header */}
      <div className="restaurant-header">
        <h1 className="restaurant-name">{menuData.name}</h1>
        {menuData.address && (
          <p className="restaurant-address">{menuData.address}</p>
        )}
        {menuData.phone && (
          <p className="restaurant-phone">{menuData.phone}</p>
        )}
        {menuData.hours && (
          <p className="restaurant-hours">{menuData.hours}</p>
        )}
      </div>

      {/* Menu Content */}
      <div className="menu-content">
        {menuData.menu && menuData.menu.sections ? (
          menuData.menu.sections.map((section, sectionIndex) => (
            <div key={section.id || sectionIndex} className="menu-section">
              <h2 className="section-title">{section.title || section.name}</h2>
              
              {section.items && section.items.length > 0 ? (
                <div className="menu-items">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.id || itemIndex} className="menu-item">
                      <div className="item-content">
                        <div className="item-info">
                          <h3 className="item-name">{item.title || item.name}</h3>
                          {item.description && (
                            <p className="item-description">{item.description}</p>
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
                <p className="no-items">Bu kategoride henüz ürün bulunmuyor.</p>
              )}
            </div>
          ))
        ) : (
          <div className="no-menu">
            <p>Henüz menü oluşturulmamış.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="menu-footer">
        <p>Bu menü dijital olarak oluşturulmuştur.</p>
      </div>
    </div>
  );
};

export default PublicMenuView;
