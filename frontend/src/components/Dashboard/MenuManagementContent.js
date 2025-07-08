import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  PencilIcon,
  PaintBrushIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  ShareIcon,
  CogIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useMenu } from '../../contexts/MenuContext';

import '../../styles/MenuManagement.css';

const MenuManagementContent = () => {
  // Safe translation hook with fallback
  const { t, ready } = useTranslation();

  // Safe translation function with fallbacks
  const safeT = (key, fallback = key) => {
    try {
      if (ready && t) {
        return t(key, fallback);
      }
      return fallback;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return fallback;
    }
  };

  const navigate = useNavigate();
  const {
    currentMenu,
    currentRestaurant,
    currentBranding,
    menuStatus,
    isLoading,
    loadDashboardMenuData,
    updateMenuStatus
  } = useMenu();
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCodeRef = useRef(null);

  // Load dashboard data when component mounts
  useEffect(() => {
    console.log('🔄 [MenuManagement] Component mounted, loading dashboard data...');
    // Use current user's restaurant data (no hardcoded slug)
    loadDashboardMenuData()
      .then(() => {
        console.log('✅ [MenuManagement] Dashboard data loaded successfully');
      })
      .catch((error) => {
        console.error('❌ [MenuManagement] Failed to load dashboard data:', error);
      });
  }, [loadDashboardMenuData]);

  // Debug current state
  console.log('🔍 [MenuManagement] Current state:', {
    isLoading,
    currentRestaurant,
    currentMenu,
    menuStatus,
    currentBranding
  });

  // Show loading state
  if (isLoading && !currentRestaurant) {
    return (
      <div className="menu-management-content">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="loading-spinner"></div>
          <p>{safeT('common.loading', 'Yükleniyor...')}</p>
        </div>
      </div>
    );
  }

  // Calculate menu statistics
  const menuStats = currentMenu ? {
    totalSections: currentMenu.sections.length,
    totalItems: currentMenu.sections.reduce((total, section) => total + section.items.length, 0)
  } : { totalSections: 0, totalItems: 0 };

  // Generate public URL
  const getPublicUrl = () => {
    if (currentRestaurant && currentRestaurant.slug) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/menu/${currentRestaurant.slug}`;
    }
    // Fallback URL
    return `${window.location.origin}/menu/example-restaurant`;
  };

  const publicUrl = getPublicUrl();

  const handleEditContent = () => {
    // Clear any existing referrer since we're starting fresh from menu management
    sessionStorage.removeItem('designCustomizationReferrer');
    // Navigate to menu creation page with existing data
    navigate('/dashboard/menu/create');
  };

  const handleCustomizeDesign = () => {
    // Clear any existing referrer since we're accessing directly from menu management
    sessionStorage.removeItem('designCustomizationReferrer');
    // Navigate to design customization page with existing data
    navigate('/dashboard/menu/customize');
  };

  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        // Fallback for HTTP or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = publicUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        // Use the deprecated method only as fallback
        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('Copy command failed');
          }
        } catch (execError) {
          throw new Error('Copy not supported');
        }
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Show error to user
      alert(safeT('menu_management.copy_error', 'Link kopyalanamadı. Lütfen manuel olarak kopyalayın.'));
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg');
      if (svg) {
        // Create a canvas to convert SVG to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        // Set canvas size
        canvas.width = 120;
        canvas.height = 120;

        // Serialize SVG to string
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          // Draw image on canvas
          ctx.drawImage(img, 0, 0);

          // Create download link
          const link = document.createElement('a');
          link.download = `${currentRestaurant?.name || 'restaurant'}-qr-menu.png`;
          link.href = canvas.toDataURL('image/png');

          // Trigger download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up
          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    }
  };

  const handlePreviewMenu = () => {
    // Get current user's restaurant slug
    const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
    const restaurantSlug = currentUser.restaurantSlug || currentRestaurant?.slug;

    console.log('🔍 [MenuManagement] Preview menu clicked');
    console.log('🔍 [MenuManagement] Current user:', currentUser);
    console.log('🔍 [MenuManagement] Restaurant slug:', restaurantSlug);
    console.log('🔍 [MenuManagement] Current restaurant:', currentRestaurant);

    if (restaurantSlug) {
      const previewUrl = `/menu/${restaurantSlug}?preview=true`;
      console.log('🔍 [MenuManagement] Opening preview URL:', previewUrl);
      window.open(previewUrl, '_blank');
    } else {
      // Show error message if no restaurant slug is available
      alert(safeT('menu_management.no_restaurant_error', 'Restoran bilgisi bulunamadı. Lütfen sayfayı yenileyin.'));
      console.error('❌ [MenuManagement] No restaurant slug available for preview');
    }
  };

  // Test public menu access (for debugging)
  const testPublicMenuAccess = async () => {
    console.log('🧪 [MenuManagement] Testing public menu access...');

    try {
      // Import menuService dynamically
      const menuService = await import('../../services/menuService');

      // Test public menu access
      const testResult = await menuService.default.testPublicMenuAccess();

      if (testResult) {
        alert('✅ Public menu access test PASSED! Your menu should be visible.');
      } else {
        alert('❌ Public menu access test FAILED! Check console for details.');
      }
    } catch (error) {
      console.error('❌ [MenuManagement] Error testing public menu access:', error);
      alert('❌ Error testing public menu access. Check console for details.');
    }
  };

  const toggleMenuStatus = async () => {
    console.log('🔄 [MenuManagement] Toggle button clicked');
    console.log('🔄 [MenuManagement] Current menuStatus:', menuStatus);
    console.log('🔄 [MenuManagement] Current restaurant:', currentRestaurant);

    try {
      const newStatus = menuStatus === 'active' ? 'draft' : 'active';
      console.log('🔄 [MenuManagement] New status will be:', newStatus);

      const result = await updateMenuStatus(newStatus);
      console.log('✅ [MenuManagement] Status update result:', result);

      // Reload data to reflect changes
      await loadDashboardMenuData();
      console.log('✅ [MenuManagement] Data reloaded successfully');

    } catch (error) {
      console.error('❌ [MenuManagement] Failed to update menu status:', error);
      alert(safeT('menu_management.status_update_error', 'Menü durumu güncellenirken bir hata oluştu.'));
    }
  };

  return (
    <div className="menu-management-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <SparklesIcon className="hero-icon" />
              {safeT('menu_management.title', 'Dijital Menünüzü Yönetin')}
            </h1>
            <p className="hero-subtitle">
              {safeT('menu_management.subtitle', 'Menünüzün içeriğini düzenleyin, tasarımını özelleştirin ve müşterilerinizle paylaşın.')}
            </p>
            <div className="hero-stats">
              <div className="stat-badge">
                <ChartBarIcon className="stat-icon" />
                <span>{menuStats.totalSections} {safeT('menu_management.categories', 'Kategori')}</span>
              </div>
              <div className="stat-badge">
                <UserGroupIcon className="stat-icon" />
                <span>{menuStats.totalItems} {safeT('menu_management.products', 'Ürün')}</span>
              </div>
              <div className="stat-badge">
                <ClockIcon className="stat-icon" />
                <span>{safeT('menu_management.last_updated', 'Son Güncelleme')}: {safeT('menu_management.today', 'Bugün')}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Status Card */}
          <div className="enhanced-status-card">
            <div className="status-header">
              <div className={`status-indicator-enhanced ${menuStatus}`}>
                {menuStatus === 'active' ? (
                  <PlayIcon className="status-icon-enhanced" />
                ) : (
                  <PauseIcon className="status-icon-enhanced" />
                )}
                <div className="status-text-group">
                  <span className="status-title">
                    {menuStatus === 'active' ? safeT('menu_management.menu_active', 'Menü Aktif') : safeT('menu_management.menu_draft', 'Menü Taslak')}
                  </span>
                  <span className="status-subtitle">
                    {menuStatus === 'active'
                      ? safeT('menu_management.active_description', 'Müşterileriniz tarafından görülebilir')
                      : safeT('menu_management.draft_description', 'Henüz yayınlanmamış')
                    }
                  </span>
                </div>
              </div>
            </div>
            <div className="status-actions">
              <button
                className={`status-toggle-enhanced ${menuStatus}`}
                onClick={toggleMenuStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    {safeT('menu_management.updating', 'Güncelleniyor...')}
                  </>
                ) : (
                  <>
                    {menuStatus === 'active' ? <PauseIcon className="button-icon" /> : <PlayIcon className="button-icon" />}
                    {menuStatus === 'active' ? safeT('menu_management.deactivate', 'Pasif Yap') : safeT('menu_management.activate', 'Aktif Yap')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Action Cards */}
      <div className="enhanced-cards-grid">
        {/* Edit Menu Content Card */}
        <div className="enhanced-card primary-card">
          <div className="card-glow"></div>
          <div className="card-header-enhanced">
            <div className="card-icon-enhanced edit-icon">
              <PencilIcon className="icon-enhanced" />
            </div>
            <div className="card-badge">
              {safeT('menu_management.most_used', 'En Çok Kullanılan')}
            </div>
          </div>

          <div className="card-content-enhanced">
            <h3 className="card-title-enhanced">{safeT('menu_management.edit_content.title', 'Menü İçeriğini Düzenle')}</h3>
            <p className="card-description-enhanced">
              {safeT('menu_management.edit_content.description', 'Kategorilerinizi, ürünlerinizi, açıklamalarınızı, fiyatlarınızı ve görsellerinizi buradan düzenleyebilirsiniz.')}
            </p>

            <div className="card-metrics">
              <div className="metric-item">
                <div className="metric-value">{menuStats.totalSections}</div>
                <div className="metric-label">{safeT('menu_management.edit_content.categories', 'Kategori')}</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <div className="metric-value">{menuStats.totalItems}</div>
                <div className="metric-label">{safeT('menu_management.edit_content.products', 'Ürün')}</div>
              </div>
            </div>
          </div>

          <div className="card-footer-enhanced">
            <button
              className="action-button-enhanced primary"
              onClick={handleEditContent}
            >
              <PencilIcon className="button-icon-enhanced" />
              <span>{safeT('menu_management.edit_content.button', 'İçeriği Düzenle')}</span>
              <div className="button-shine"></div>
            </button>
          </div>
        </div>

        {/* Customize Design Card */}
        <div className="enhanced-card design-card">
          <div className="card-glow design-glow"></div>
          <div className="card-header-enhanced">
            <div className="card-icon-enhanced design-icon">
              <PaintBrushIcon className="icon-enhanced" />
            </div>
            <div className="card-badge design-badge">
              {safeT('menu_management.creative', 'Yaratıcı')}
            </div>
          </div>

          <div className="card-content-enhanced">
            <h3 className="card-title-enhanced">{safeT('menu_management.customize_design.title', 'Menü Tasarımını Özelleştir')}</h3>
            <p className="card-description-enhanced">
              {safeT('menu_management.customize_design.description', 'Menünüzün logosunu, metin rengini, arka plan rengini ve vurgu rengini buradan değiştirebilirsiniz.')}
            </p>

            <div className="design-preview-enhanced">
              <div className="color-palette">
                <div className="palette-label">{safeT('menu_management.customize_design.current_palette', 'Mevcut Renk Paleti')}</div>
                <div className="color-swatches-enhanced">
                  <div
                    className="color-swatch-enhanced primary"
                    style={{ backgroundColor: currentBranding?.colors?.accentColor || currentBranding?.primaryColor || '#8b5cf6' }}
                    title="Ana Renk"
                  ></div>
                  <div
                    className="color-swatch-enhanced secondary"
                    style={{ backgroundColor: currentBranding?.colors?.textColor || '#1f2937' }}
                    title="Metin Rengi"
                  ></div>
                  <div
                    className="color-swatch-enhanced tertiary"
                    style={{ backgroundColor: currentBranding?.colors?.backgroundColor || '#ffffff', border: '1px solid #e5e7eb' }}
                    title="Arka Plan Rengi"
                  ></div>
                </div>
              </div>
              <div className="design-features">
                <div className="feature-tag">Logo</div>
                <div className="feature-tag">Renkler</div>
                <div className="feature-tag">Tipografi</div>
              </div>
            </div>
          </div>

          <div className="card-footer-enhanced">
            <button
              className="action-button-enhanced secondary"
              onClick={handleCustomizeDesign}
            >
              <PaintBrushIcon className="button-icon-enhanced" />
              <span>{safeT('menu_management.customize_design.button', 'Tasarımı Özelleştir')}</span>
              <div className="button-shine"></div>
            </button>
          </div>
        </div>

        {/* View & Share Menu Card */}
        <div className="enhanced-card share-card">
          <div className="card-glow share-glow"></div>
          <div className="card-header-enhanced">
            <div className="card-icon-enhanced share-icon">
              <ShareIcon className="icon-enhanced" />
            </div>
            <div className="card-badge share-badge">
              {safeT('menu_management.essential', 'Temel')}
            </div>
          </div>

          <div className="card-content-enhanced">
            <h3 className="card-title-enhanced">{safeT('menu_management.view_share.title', 'Menüyü Görüntüle ve Paylaş')}</h3>
            <p className="card-description-enhanced">
              {safeT('menu_management.view_share.description', 'QR kod ve link ile menünüzü müşterilerinizle paylaşın.')}
            </p>

            <div className="share-content-enhanced">
              {/* Enhanced QR Code Section */}
              <div className="qr-section-enhanced">
                <div className="qr-container-enhanced">
                  <div className="qr-code-wrapper" ref={qrCodeRef}>
                    <QRCodeSVG
                      value={publicUrl}
                      size={100}
                      level="M"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="qr-overlay">
                    <DevicePhoneMobileIcon className="qr-overlay-icon" />
                  </div>
                </div>
                <div className="qr-actions">
                  <button
                    className="qr-action-btn download"
                    onClick={handleDownloadQR}
                    title={safeT('menu_management.view_share.download_qr', 'QR Kodu İndir')}
                  >
                    <ArrowDownTrayIcon className="qr-action-icon" />
                  </button>
                  <button
                    className="qr-action-btn preview"
                    onClick={handlePreviewMenu}
                    title={safeT('menu_management.view_share.preview_menu', 'Menüyü Önizle')}
                  >
                    <EyeIcon className="qr-action-icon" />
                  </button>
                </div>
              </div>

              {/* Enhanced Link Section */}
              <div className="link-section-enhanced">
                <div className="link-display">
                  <div className="link-header">
                    <GlobeAltIcon className="link-header-icon" />
                    <span className="link-label-enhanced">{safeT('menu_management.view_share.menu_link', 'Menü Linki')}</span>
                  </div>
                  <div className="link-container-enhanced">
                    <div className="link-url-enhanced" title={publicUrl}>
                      {publicUrl.length > 45 ? `${publicUrl.substring(0, 42)}...` : publicUrl}
                    </div>
                    <button
                      className={`copy-button-enhanced ${copySuccess ? 'success' : ''}`}
                      onClick={handleCopyLink}
                    >
                      {copySuccess ? (
                        <CheckCircleIcon className="copy-icon" />
                      ) : (
                        <DocumentDuplicateIcon className="copy-icon" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="share-stats">
                  <div className="share-stat">
                    <span className="stat-number">∞</span>
                    <span className="stat-text">{safeT('menu_management.unlimited_access', 'Sınırsız Erişim')}</span>
                  </div>
                  <div className="share-stat">
                    <span className="stat-number">24/7</span>
                    <span className="stat-text">{safeT('menu_management.always_available', 'Her Zaman Açık')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-footer-enhanced">
            <button
              className="action-button-enhanced tertiary full-width"
              onClick={handlePreviewMenu}
            >
              <EyeIcon className="button-icon-enhanced" />
              <span>{safeT('menu_management.view_share.preview_menu', 'Canlı Önizleme')}</span>
              <div className="button-shine"></div>
            </button>

            {/* Debug Test Buttons */}
            <button
              className="action-button-enhanced secondary full-width"
              onClick={testPublicMenuAccess}
              style={{ marginTop: '10px', backgroundColor: '#f59e0b' }}
            >
              <CheckCircleIcon className="button-icon-enhanced" />
              <span>🧪 Test Public Menu Access</span>
              <div className="button-shine"></div>
            </button>

            <button
              className="action-button-enhanced secondary full-width"
              onClick={() => {
                const currentUser = JSON.parse(localStorage.getItem('authUser') || '{}');
                const restaurantSlug = currentUser.restaurantSlug || currentRestaurant?.slug;
                if (restaurantSlug) {
                  const publicUrl = `/menu/${restaurantSlug}`;
                  console.log('🔍 [MenuManagement] Opening public URL:', publicUrl);
                  window.open(publicUrl, '_blank');
                } else {
                  alert('No restaurant slug found');
                }
              }}
              style={{ marginTop: '10px', backgroundColor: '#10b981' }}
            >
              <GlobeAltIcon className="button-icon-enhanced" />
              <span>🌐 Open Public Menu</span>
              <div className="button-shine"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Analytics Dashboard */}
      <div className="analytics-dashboard">
        <div className="dashboard-header">
          <h3 className="dashboard-title">
            <ChartBarIcon className="dashboard-icon" />
            {safeT('menu_management.analytics.title', 'Menü Analitikleri')}
          </h3>
          <div className="dashboard-subtitle">
            {safeT('menu_management.analytics.subtitle', 'Menünüzün performansını takip edin')}
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-icon restaurant">
              <CogIcon className="analytics-icon-svg" />
            </div>
            <div className="analytics-content">
              <div className="analytics-label">{safeT('menu_management.menu_info.restaurant_name', 'Restoran Adı')}</div>
              <div className="analytics-value">{currentRestaurant?.name || safeT('menu_management.menu_info.loading', 'Yükleniyor...')}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon update">
              <ClockIcon className="analytics-icon-svg" />
            </div>
            <div className="analytics-content">
              <div className="analytics-label">{safeT('menu_management.menu_info.last_update', 'Son Güncelleme')}</div>
              <div className="analytics-value">{new Date().toLocaleDateString('tr-TR')}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon categories">
              <ChartBarIcon className="analytics-icon-svg" />
            </div>
            <div className="analytics-content">
              <div className="analytics-label">{safeT('menu_management.menu_info.total_categories', 'Toplam Kategori')}</div>
              <div className="analytics-value">{menuStats.totalSections}</div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-icon products">
              <UserGroupIcon className="analytics-icon-svg" />
            </div>
            <div className="analytics-content">
              <div className="analytics-label">{safeT('menu_management.menu_info.total_products', 'Toplam Ürün')}</div>
              <div className="analytics-value">{menuStats.totalItems}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagementContent;
