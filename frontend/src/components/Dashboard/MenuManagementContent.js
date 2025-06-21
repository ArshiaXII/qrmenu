import { useState, useEffect, useRef } from 'react';
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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useMenu } from '../../contexts/MenuContext';
import '../../styles/MenuManagement.css';

const MenuManagementContent = () => {
  const { t } = useTranslation();
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
    // In production, this would use the actual restaurant ID from auth context
    loadDashboardMenuData('lezzet-restaurant');
  }, [loadDashboardMenuData]);

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
          <p>Menü verileri yükleniyor...</p>
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
    if (currentRestaurant) {
      // Production server URL
      if (window.location.hostname === '45.131.0.36' || window.location.hostname.includes('45.131.0.36')) {
        return `http://45.131.0.36:3000/menu/${currentRestaurant.slug}`;
      }
      // Local development
      return `${window.location.origin}/menu/${currentRestaurant.slug}`;
    }
    return 'http://45.131.0.36:3000/menu/lezzet-restaurant';
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
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Show error to user
      alert('Link kopyalanamadı. Lütfen manuel olarak kopyalayın.');
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
    // Open public menu view in new tab with preview parameter
    if (currentRestaurant && currentRestaurant.slug) {
      window.open(`/menu/${currentRestaurant.slug}?preview=true`, '_blank');
    } else {
      // Fallback to default restaurant slug
      window.open('/menu/lezzet-restaurant?preview=true', '_blank');
    }
  };

  const toggleMenuStatus = async () => {
    try {
      const newStatus = menuStatus === 'active' ? false : true;
      await updateMenuStatus(newStatus, 'lezzet-restaurant');
    } catch (error) {
      console.error('Failed to update menu status:', error);
      // You could show a toast notification here
    }
  };

  return (
    <div className="menu-management-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">{t('menu_management.title')}</h1>
          <p className="page-subtitle">
            {t('menu_management.subtitle')}
          </p>
        </div>

        {/* Menu Status */}
        <div className="menu-status-card">
          <div className="status-info">
            <div className={`status-indicator ${menuStatus}`}>
              {menuStatus === 'active' ? (
                <CheckCircleIcon className="status-icon" />
              ) : (
                <ExclamationTriangleIcon className="status-icon" />
              )}
              <span className="status-text">
                {menuStatus === 'active' ? t('menu_management.menu_active') : t('menu_management.menu_draft')}
              </span>
            </div>
            <p className="status-description">
              {menuStatus === 'active'
                ? t('menu_management.active_description')
                : t('menu_management.draft_description')
              }
            </p>
          </div>
          <button
            className={`status-toggle ${menuStatus}`}
            onClick={toggleMenuStatus}
            disabled={isLoading}
          >
            {isLoading ? t('menu_management.updating') : (menuStatus === 'active' ? t('menu_management.deactivate') : t('menu_management.activate'))}
          </button>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="action-cards-grid">
        {/* Edit Menu Content Card */}
        <div className="action-card">
          <div className="card-header">
            <div className="card-icon edit-icon">
              <PencilIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.edit_content.title')}</h3>
              <p className="card-description">
                {t('menu_management.edit_content.description')}
              </p>
            </div>
          </div>
          
          <div className="card-stats">
            <div className="stat-item">
              <span className="stat-value">{menuStats.totalSections}</span>
              <span className="stat-label">{t('menu_management.edit_content.categories')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{menuStats.totalItems}</span>
              <span className="stat-label">{t('menu_management.edit_content.products')}</span>
            </div>
          </div>

          <div className="card-footer">
            <button 
              className="action-button primary"
              onClick={handleEditContent}
            >
              <PencilIcon className="button-icon" />
              {t('menu_management.edit_content.button')}
            </button>
          </div>
        </div>

        {/* Customize Design Card */}
        <div className="action-card">
          <div className="card-header">
            <div className="card-icon design-icon">
              <PaintBrushIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.customize_design.title')}</h3>
              <p className="card-description">
                {t('menu_management.customize_design.description')}
              </p>
            </div>
          </div>

          <div className="design-preview">
            <div className="color-swatches">
              <div className="color-swatch" style={{ backgroundColor: currentBranding?.colors.accentColor || '#8b5cf6' }}></div>
              <div className="color-swatch" style={{ backgroundColor: currentBranding?.colors.textColor || '#1f2937' }}></div>
              <div className="color-swatch" style={{ backgroundColor: currentBranding?.colors.backgroundColor || '#ffffff', border: '1px solid #e5e7eb' }}></div>
            </div>
            <span className="preview-label">{t('menu_management.customize_design.current_palette')}</span>
          </div>

          <div className="card-footer">
            <button 
              className="action-button secondary"
              onClick={handleCustomizeDesign}
            >
              <PaintBrushIcon className="button-icon" />
              {t('menu_management.customize_design.button')}
            </button>
          </div>
        </div>

        {/* View & Share Menu Card */}
        <div className="action-card share-card">
          <div className="card-header">
            <div className="card-icon share-icon">
              <QrCodeIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">{t('menu_management.view_share.title')}</h3>
              <p className="card-description">
                {t('menu_management.view_share.description')}
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
              <button
                className="qr-download-btn"
                onClick={handleDownloadQR}
              >
                <ArrowDownTrayIcon className="button-icon" />
                {t('menu_management.view_share.download_qr')}
              </button>
            </div>

            {/* Link Section */}
            <div className="link-section">
              <div className="link-container">
                <LinkIcon className="link-icon" />
                <div className="link-content">
                  <span className="link-label">{t('menu_management.view_share.menu_link')}</span>
                  <span className="link-url" title={publicUrl}>
                    {publicUrl.length > 50 ? `${publicUrl.substring(0, 47)}...` : publicUrl}
                  </span>
                </div>
              </div>
              
              <div className="link-actions">
                <button 
                  className={`copy-button ${copySuccess ? 'success' : ''}`}
                  onClick={handleCopyLink}
                >
                  {copySuccess ? (
                    <>
                      <CheckCircleIcon className="button-icon" />
                      {t('menu_management.view_share.copied')}
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="button-icon" />
                      {t('menu_management.view_share.copy_link')}
                    </>
                  )}
                </button>
                
                <button 
                  className="preview-button"
                  onClick={handlePreviewMenu}
                >
                  <EyeIcon className="button-icon" />
                  {t('menu_management.view_share.preview_menu')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Information */}
      <div className="menu-info-section">
        <h3 className="info-title">{t('menu_management.menu_info.title')}</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">{t('menu_management.menu_info.restaurant_name')}</span>
            <span className="info-value">{currentRestaurant?.name || t('menu_management.menu_info.loading')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('menu_management.menu_info.last_update')}</span>
            <span className="info-value">{new Date().toLocaleDateString('tr-TR')}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('menu_management.menu_info.total_categories')}</span>
            <span className="info-value">{menuStats.totalSections}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('menu_management.menu_info.total_products')}</span>
            <span className="info-value">{menuStats.totalItems}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagementContent;
