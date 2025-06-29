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
    <div className="public-menu-view" style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: '1.6',
      color: '#1f2937',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      padding: '0',
      margin: '0'
    }}>
      {/* Preview Banner */}
      {isPreview && (
        <div className="preview-banner" style={{
          backgroundColor: '#fef3c7',
          padding: '12px 20px',
          textAlign: 'center',
          borderBottom: '1px solid #f59e0b',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <p style={{ margin: '0' }}>🔍 <strong>Önizleme Modu</strong> - Bu menünün nasıl görüneceğini inceliyorsunuz</p>
        </div>
      )}

      {/* Restaurant Header */}
      <div className="restaurant-header" style={{
        backgroundColor: '#ffffff',
        padding: '24px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 className="restaurant-name" style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 16px 0'
        }}>{menuData.name || 'Restaurant'}</h1>

        {menuData.address && (
          <div className="restaurant-info" style={{ marginBottom: '12px' }}>
            <p className="restaurant-address" style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>📍 {menuData.address}</p>
          </div>
        )}

        <div className="restaurant-contact" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center'
        }}>
          {menuData.phone && (
            <p className="restaurant-phone" style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>📞 {menuData.phone}</p>
          )}
          {menuData.hours && (
            <p className="restaurant-hours" style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>🕒 {menuData.hours}</p>
          )}
        </div>
      </div>

      {/* Menu Content */}
      <div className="menu-content" style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {menuData.menu && menuData.menu.sections && menuData.menu.sections.length > 0 ? (
          <div className="menu-sections">
            {menuData.menu.sections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className="menu-section" style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h2 className="section-title" style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '20px',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #8b5cf6'
                }}>
                  {getText(section.name || section.title, `Kategori ${sectionIndex + 1}`)}
                </h2>

                {section.items && section.items.length > 0 ? (
                  <div className="menu-items" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {section.items.map((item, itemIndex) => (
                      <div key={item.id || itemIndex} className="menu-item" style={{
                        padding: '16px',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        transition: 'all 0.2s ease'
                      }}>
                        <div className="item-content" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '16px'
                        }}>
                          <div className="item-info" style={{ flex: '1' }}>
                            <h3 className="item-name" style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#1f2937',
                              margin: '0 0 8px 0'
                            }}>
                              {getText(item.name || item.title, 'Ürün')}
                            </h3>
                            {(item.description || (typeof item.description === 'object' && item.description)) && (
                              <p className="item-description" style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                margin: '0',
                                lineHeight: '1.5'
                              }}>
                                {getText(item.description)}
                              </p>
                            )}
                          </div>
                          <div className="item-price">
                            {item.price && (
                              <span className="price" style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#8b5cf6',
                                whiteSpace: 'nowrap'
                              }}>₺{Number(item.price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-items" style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6b7280'
                  }}>
                    <p style={{ margin: '0', fontSize: '16px' }}>Bu kategoride henüz ürün bulunmuyor.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-menu" style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div className="no-menu-content">
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px'
              }}>Henüz Menü Oluşturulmamış</h2>
              <p style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0'
              }}>Bu restoran henüz menüsünü hazırlamamış.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="menu-footer" style={{
        backgroundColor: '#1f2937',
        color: '#ffffff',
        textAlign: 'center',
        padding: '24px 20px',
        marginTop: '40px'
      }}>
        <p style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          opacity: '0.8'
        }}>Bu menü dijital olarak oluşturulmuştur.</p>
        <p className="powered-by" style={{
          margin: '0',
          fontSize: '12px',
          opacity: '0.6'
        }}>QR Menu Platform ile hazırlanmıştır</p>
      </div>

      {/* Mobile Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .public-menu-view {
            font-size: 14px;
          }
          .restaurant-header h1 {
            font-size: 24px !important;
          }
          .menu-content {
            padding: 16px !important;
          }
          .menu-section {
            padding: 20px !important;
            margin-bottom: 20px !important;
          }
          .section-title {
            font-size: 20px !important;
          }
          .item-content {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .item-name {
            font-size: 16px !important;
          }
          .item-price {
            align-self: flex-end;
          }
          .restaurant-contact {
            flex-direction: column !important;
          }
        }

        @media (max-width: 480px) {
          .restaurant-header {
            padding: 20px 16px !important;
          }
          .menu-content {
            padding: 12px !important;
          }
          .menu-section {
            padding: 16px !important;
          }
          .section-title {
            font-size: 18px !important;
          }
          .item-name {
            font-size: 15px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicMenuView;
