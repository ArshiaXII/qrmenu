import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import menuService from '../../services/menuService';
import './PublicMenuView.css';

const PublicMenuView = () => {
  const { slug } = useParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // RULE 3: Get public menu data (only if active)
        const data = menuService.getPublicMenuData(slug);
        
        if (data) {
          setRestaurantData(data);
        } else {
          setError('MENU_UNAVAILABLE');
        }
      } catch (error) {
        console.error('Error loading public menu:', error);
        setError('LOAD_ERROR');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadMenuData();
    }
  }, [slug]);

  // Show loading state
  if (loading) {
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Menü yükleniyor...</p>
      </div>
    );
  }

  // Show error/unavailable state
  if (error || !restaurantData) {
    return (
      <div className="public-menu-error">
        <div className="error-content">
          <h2>Menü Mevcut Değil</h2>
          <p>
            {error === 'MENU_UNAVAILABLE' 
              ? 'Bu menü şu anda mevcut değil veya aktif değil.'
              : 'Menü yüklenirken bir hata oluştu.'
            }
          </p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Get branding colors with fallbacks
  const colors = restaurantData.branding?.colors || {};
  const primaryColor = colors.primary || '#8b5cf6';
  const textColor = colors.text || '#1f2937';
  const backgroundColor = colors.background || '#ffffff';

  return (
    <div 
      className="public-menu-view"
      style={{
        '--primary-color': primaryColor,
        '--text-color': textColor,
        '--background-color': backgroundColor
      }}
    >
      {/* Restaurant Header */}
      <header className="restaurant-header">
        {restaurantData.branding?.logo && (
          <div className="restaurant-logo">
            <img src={restaurantData.branding.logo} alt={restaurantData.name} />
          </div>
        )}
        <div className="restaurant-info">
          <h1 className="restaurant-name">{restaurantData.name}</h1>
          {restaurantData.settings?.address && (
            <p className="restaurant-address">{restaurantData.settings.address}</p>
          )}
          {restaurantData.settings?.phone && (
            <p className="restaurant-phone">{restaurantData.settings.phone}</p>
          )}
        </div>
      </header>

      {/* Menu Content */}
      <main className="menu-content">
        {restaurantData.menu?.sections && restaurantData.menu.sections.length > 0 ? (
          restaurantData.menu.sections.map((section) => (
            <section key={section.id} className="menu-section">
              <div className="section-header">
                {section.image && (
                  <div className="section-image">
                    <img src={section.image} alt={section.title} />
                  </div>
                )}
                <div className="section-info">
                  <h2 className="section-title">
                    {typeof section.title === 'string' ? section.title : section.title?.tr || section.title?.en || 'Bölüm'}
                  </h2>
                  {section.description && (
                    <p className="section-description">
                      {typeof section.description === 'string' ? section.description : section.description?.tr || section.description?.en || ''}
                    </p>
                  )}
                </div>
              </div>

              {section.items && section.items.length > 0 && (
                <div className="menu-items">
                  {section.items
                    .filter(item => item.isAvailable !== false)
                    .map((item) => (
                      <div key={item.id} className="menu-item">
                        <div className="item-content">
                          <div className="item-info">
                            <h3 className="item-name">
                              {typeof item.title === 'string' ? item.title : item.title?.tr || item.title?.en || 'Ürün'}
                            </h3>
                            {item.description && (
                              <p className="item-description">
                                {typeof item.description === 'string' ? item.description : item.description?.tr || item.description?.en || ''}
                              </p>
                            )}
                          </div>
                          <div className="item-price">
                            <span className="price">
                              {restaurantData.settings?.currency || 'TRY'} {item.price}
                            </span>
                          </div>
                        </div>
                        {item.image && (
                          <div className="item-image">
                            <img src={item.image} alt={item.title} />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </section>
          ))
        ) : (
          <div className="empty-menu">
            <p>Bu restoran henüz menü eklenmemiş.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="menu-footer">
        <p>Bu menü QR Menu platformu ile oluşturulmuştur.</p>
      </footer>
    </div>
  );
};

export default PublicMenuView;
