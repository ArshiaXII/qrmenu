import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import {
  PencilIcon,
  PaintBrushIcon,
  QrCodeIcon,
  LinkIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useMenu } from '../../contexts/MenuContext';
import menuService from '../../services/menuServiceFinal';
import '../../styles/MenuManagement.css';

const MenuManagementContent = () => {
  // Safe translation hook with fallback
  let t;
  try {
    const translation = useTranslation();
    t = (key, fallback) => {
      try {
        const result = translation.t(key);
        // If translation returns the key itself, use fallback
        return result === key ? fallback : result;
      } catch (error) {
        return fallback || key;
      }
    };
  } catch (error) {
    console.warn('Translation hook error:', error);
    t = (key, fallback) => fallback || key;
  }

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

  // Load restaurant data on mount
  useEffect(() => {
    if (loadDashboardMenuData) {
      loadDashboardMenuData();
    }
  }, [loadDashboardMenuData]);

  // Generate public URL using custom slug
  const getPublicUrl = () => {
    if (currentRestaurant && currentRestaurant.slug) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/menu/${currentRestaurant.slug}`;
    }
    return `${window.location.origin}/menu/your-restaurant`;
  };

  // Toggle menu status (active/inactive)
  const toggleMenuStatus = async () => {
    try {
      const newStatus = menuStatus === 'active' ? 'inactive' : 'active';
      await updateMenuStatus(newStatus);
      // Reload dashboard data to reflect changes
      if (loadDashboardMenuData) {
        await loadDashboardMenuData();
      }
    } catch (error) {
      console.error('Failed to update menu status:', error);
      alert('Menü durumu güncellenirken bir hata oluştu.');
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    const url = getPublicUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Link kopyalanamadı. Lütfen manuel olarak kopyalayın.');
    }
  };

  // Download QR code
  const handleDownloadQR = () => {
    if (qrCodeRef.current) {
      const svg = qrCodeRef.current.querySelector('svg');
      if (svg) {
        // Create a canvas to convert SVG to PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Download as PNG
          canvas.toBlob((blob) => {
            const link = document.createElement('a');
            link.download = `${currentRestaurant?.name || 'restaurant'}-qr-code.png`;
            link.href = URL.createObjectURL(blob);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up
            URL.revokeObjectURL(link.href);
          });
          
          // Clean up
          URL.revokeObjectURL(url);
        };
        
        img.src = url;
      }
    }
  };

  // Preview menu
  const handlePreviewMenu = () => {
    if (currentRestaurant && currentRestaurant.slug) {
      window.open(`/menu/${currentRestaurant.slug}?preview=true`, '_blank');
    }
  };

  // Navigation handlers
  const handleEditContent = () => {
    navigate('/dashboard/menu-creation');
  };

  const handleDesignCustomization = () => {
    navigate('/dashboard/design-customization');
  };

  const handleRestaurantSettings = () => {
    navigate('/dashboard/settings/restaurant');
  };

  const publicUrl = getPublicUrl();

  // Calculate menu stats
  const menuStats = currentMenu?.sections ? {
    totalSections: currentMenu.sections.length,
    totalItems: currentMenu.sections.reduce((total, section) => total + (section.items?.length || 0), 0)
  } : { totalSections: 0, totalItems: 0 };

  if (isLoading && !currentRestaurant) {
    return (
      <div className="menu-management-loading">
        <div className="loading-spinner"></div>
        <p>{t('menu_management.loading', 'Menü bilgileri yükleniyor...')}</p>
      </div>
    );
  }

  return (
    <div className="menu-management-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">{t('menu_management.title', 'Dijital Menünüzü Yönetin')}</h1>
          <p className="page-subtitle">
            {t('menu_management.subtitle', 'Menünüzü düzenleyin, tasarımını özelleştirin ve QR kod ile paylaşın')}
          </p>
        </div>

        {/* Menu Status Card */}
        <div className="menu-status-card">
          <div className="status-info">
            <div className={`status-indicator ${menuStatus === 'active' ? 'active' : ''}`}>
              {menuStatus === 'active' ? (
                <CheckCircleIcon className="status-icon" />
              ) : (
                <ExclamationTriangleIcon className="status-icon" />
              )}
              <span className="status-text">
                {menuStatus === 'active'
                  ? t('menu_management.active_title', 'Menü Aktif')
                  : t('menu_management.draft_title', 'Menü Pasif')
                }
              </span>
            </div>
            <p className="status-description">
              {menuStatus === 'active'
                ? t('menu_management.active_description', 'Menünüz yayında, herkes görebilir.')
                : t('menu_management.draft_description', 'Menünüz henüz yayınlanmamış, sadece siz görebilirsiniz.')
              }
            </p>
          </div>
          <button
            className={`status-toggle ${menuStatus}`}
            onClick={toggleMenuStatus}
            disabled={isLoading}
          >
            {isLoading ? t('menu_management.updating', 'Güncelleniyor...') : (menuStatus === 'active' ? t('menu_management.deactivate', 'Pasif Yap') : t('menu_management.activate', 'Aktif Yap'))}
          </button>
        </div>
      </div>

      {/* Restaurant Stats */}
      <div className="restaurant-stats-section">
        <div className="restaurant-info">
          <h2 className="restaurant-name">
            {currentRestaurant?.name || t('menu_management.no_restaurant_name', 'Restoran Adı Belirtilmemiş')}
          </h2>
          <div className="restaurant-stats">
            <span className="stat">
              <strong>{menuStats.totalSections}</strong> {t('menu_management.categories', 'Kategori')}
            </span>
            <span className="stat">
              <strong>{menuStats.totalItems}</strong> {t('menu_management.items', 'Ürün')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards-grid">
        {/* Edit Content Card */}
        <div className="action-card edit-card">
          <div className="card-header">
            <div className="card-icon edit-icon">
              <PencilIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.edit_content.title', 'Menü İçeriğini Düzenle')}</h3>
              <p className="card-description">
                {t('menu_management.edit_content.description', 'Kategoriler, ürünler ve fiyatları düzenleyin')}
              </p>
            </div>
          </div>
          <button onClick={handleEditContent} className="card-action-btn edit-btn">
            {t('menu_management.edit_content.button', 'İçeriği Düzenle')}
          </button>
        </div>

        {/* Design Customization Card */}
        <div className="action-card design-card">
          <div className="card-header">
            <div className="card-icon design-icon">
              <PaintBrushIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.design.title', 'Tasarım Özelleştirme')}</h3>
              <p className="card-description">
                {t('menu_management.design.description', 'Menünüzün görünümünü ve stilini özelleştirin')}
              </p>
            </div>
          </div>
          <button onClick={handleDesignCustomization} className="card-action-btn design-btn">
            {t('menu_management.design.button', 'Tasarımı Özelleştir')}
          </button>
        </div>

        {/* View & Share Menu Card */}
        <div className="action-card share-card">
          <div className="card-header">
            <div className="card-icon share-icon">
              <QrCodeIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.view_share.title', 'Menüyü Görüntüle ve Paylaş')}</h3>
              <p className="card-description">
                {t('menu_management.view_share.description', 'QR kod ile menünüzü paylaşın ve önizleyin')}
              </p>
            </div>
          </div>

          <div className="share-content">
            {/* QR Code Section */}
            <div className="qr-section">
              <div className="qr-code-container" ref={qrCodeRef}>
                <QRCodeSVG
                  value={publicUrl}
                  size={120}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <div className="qr-actions">
                <button onClick={handleDownloadQR} className="qr-action-btn">
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  {t('menu_management.download', 'İndir')}
                </button>
              </div>
            </div>

            {/* URL Section */}
            <div className="url-section">
              <div className="url-display">
                <span className="url-text">{publicUrl}</span>
                <button
                  onClick={handleCopyUrl}
                  className={`copy-btn ${copySuccess ? 'success' : ''}`}
                  title={t('menu_management.copy_url', 'URL\'yi kopyala')}
                >
                  {copySuccess ? (
                    <CheckCircleIcon className="w-4 h-4" />
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="share-actions">
                <button onClick={handlePreviewMenu} className="preview-btn">
                  <EyeIcon className="w-4 h-4" />
                  {t('menu_management.preview', 'Önizleme')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Settings Card */}
        <div className="action-card settings-card">
          <div className="card-header">
            <div className="card-icon settings-icon">
              <BuildingStorefrontIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.restaurant_settings.title', 'Restoran Ayarları')}</h3>
              <p className="card-description">
                {t('menu_management.restaurant_settings.description', 'Restoran adı, adres ve iletişim bilgilerini düzenleyin')}
              </p>
            </div>
          </div>
          <button onClick={handleRestaurantSettings} className="card-action-btn settings-btn">
            {t('menu_management.restaurant_settings.button', 'Ayarları Düzenle')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuManagementContent;
