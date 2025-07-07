import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import menuService from '../../services/menuServiceFinal';
import './PublicMenuView.css';
import '../../styles/PublicMenu.css';

const PublicMenuView = () => {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  
  // State
  const [menuData, setMenuData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load menu data when component mounts
  useEffect(() => {
    const loadMenuData = async () => {
      console.log('🔍 [PublicMenuView] Loading menu data for slug:', restaurantSlug);
      console.log('🔍 [PublicMenuView] User agent:', navigator.userAgent);
      console.log('🔍 [PublicMenuView] Is mobile:', /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

      if (!restaurantSlug) {
        console.log('❌ [PublicMenuView] No restaurant slug provided');
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(false);

        console.log('🔍 [PublicMenuView] Attempting to load data...');

        let data;
        if (isPreview) {
          console.log('🔍 [PublicMenuView] Loading preview data');
          data = await menuService.getPreviewMenuData(restaurantSlug);
        } else {
          console.log('🔍 [PublicMenuView] Loading public data');
          data = await menuService.getPublicMenuData(restaurantSlug);
        }

        console.log('🔍 [PublicMenuView] Data received:', data);

        if (data) {
          console.log('✅ [PublicMenuView] Menu data loaded successfully');
          setMenuData(data);
        } else {
          console.log('❌ [PublicMenuView] No data received');
          setError(true);
        }

      } catch (error) {
        console.error('❌ [PublicMenuView] Error loading menu data:', error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantSlug, isPreview]);

  // Helper function to get text with fallback
  const getText = (value, fallback = '') => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value) {
      return value.tr || value.en || Object.values(value)[0] || fallback;
    }
    return fallback;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Menü yükleniyor...</p>
      </div>
    );
  }

  // Error state (menu unavailable)
  if (error || !menuData) {
    return (
      <div className="public-menu-unavailable">
        <div className="unavailable-content">
          <h1>Menü Şu Anda Mevcut Değil</h1>
          <p>Bu restoran menüsü şu anda erişilebilir durumda değil.</p>
          <p>Lütfen daha sonra tekrar deneyin.</p>
          {isPreview && (
            <div className="preview-notice">
              <p><strong>Önizleme Modu:</strong> Bu menü henüz aktif değil.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success state - render menu
  return (
    <div className="public-menu-view">
      {/* Preview Banner */}
      {isPreview && (
        <div className="preview-banner">
          <p>🔍 <strong>Önizleme Modu</strong> - Bu menünün nasıl görüneceğini inceliyorsunuz</p>
        </div>
      )}

      {/* Restaurant Header */}
      <div className="restaurant-header">
        <h1 className="restaurant-name">{menuData.name || 'Restaurant'}</h1>

        {menuData.address && (
          <div className="restaurant-info">
            <p className="restaurant-address">📍 {menuData.address}</p>
          </div>
        )}

        <div className="restaurant-contact">
          {menuData.phone && (
            <p className="restaurant-phone">📞 {menuData.phone}</p>
          )}
          {menuData.hours && (
            <p className="restaurant-hours">🕒 {menuData.hours}</p>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div className="menu-content">
        {menuData.menu && menuData.menu.sections && menuData.menu.sections.length > 0 ? (
          <div className="menu-sections">
            {menuData.menu.sections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className="menu-section">
                <h2 className="section-title">
                  {getText(section.name || section.title, `Kategori ${sectionIndex + 1}`)}
                </h2>

                {section.items && section.items.length > 0 ? (
                  <div className="menu-items">
                    {section.items.map((item, itemIndex) => (
                      <div key={item.id || itemIndex} className="menu-item">
                        <div className="item-content">
                          <div className="item-info">
                            <h3 className="item-name">
                              {getText(item.name || item.title, 'Ürün')}
                            </h3>
                            {(item.description || (typeof item.description === 'object' && item.description)) && (
                              <p className="item-description">
                                {getText(item.description)}
                              </p>
                            )}
                          </div>
                          <div className="item-price">
                            {item.price && (
                              <span className="price">₺{Number(item.price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-items">
                    <p>Bu kategoride henüz ürün bulunmuyor.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-menu">
            <div className="no-menu-content">
              <h2>Henüz Menü Oluşturulmamış</h2>
              <p>Bu restoran henüz menüsünü hazırlamamış.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="menu-footer">
        <p>Bu menü dijital olarak oluşturulmuştur.</p>
        <p className="powered-by">QR Menu Platform ile hazırlanmıştır</p>
      </div>
    </div>
  );
};

export default PublicMenuView;
