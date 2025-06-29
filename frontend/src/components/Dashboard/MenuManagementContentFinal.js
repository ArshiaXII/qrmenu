import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  PencilIcon,
  PaintBrushIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import menuService from '../../services/menuServiceFinal';
import '../../styles/MenuManagement.css';

const MenuManagementContent = () => {
  const navigate = useNavigate();
  
  // State
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [menuStatus, setMenuStatus] = useState('inactive');
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCodeRef = useRef(null);

  // Load restaurant data on mount
  useEffect(() => {
    loadRestaurantData();
  }, []);

  // Load current user's restaurant data
  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      const restaurantData = menuService.getCurrentUserRestaurant();
      
      if (restaurantData) {
        setCurrentRestaurant(restaurantData);
        setMenuStatus(restaurantData.status || 'inactive');
      }
    } catch (error) {
      console.error('Error loading restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsLoading(true);
      const newStatus = menuStatus === 'active' ? 'inactive' : 'active';
      
      await menuService.updateMenuStatus(newStatus);
      setMenuStatus(newStatus);
      
      // Reload restaurant data to ensure consistency
      await loadRestaurantData();
      
    } catch (error) {
      console.error('Failed to update menu status:', error);
      alert('Menü durumu güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
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
  const menuStats = currentRestaurant?.menu?.sections ? {
    totalSections: currentRestaurant.menu.sections.length,
    totalItems: currentRestaurant.menu.sections.reduce((total, section) => total + (section.items?.length || 0), 0)
  } : { totalSections: 0, totalItems: 0 };

  if (isLoading && !currentRestaurant) {
    return (
      <div className="menu-management-loading">
        <div className="loading-spinner"></div>
        <p>Menü bilgileri yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="menu-management-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Dijital Menünüzü Yönetin</h1>
          <p className="page-subtitle">
            Menünüzü düzenleyin, tasarımını özelleştirin ve QR kod ile paylaşın
          </p>
        </div>
      </div>

      {/* Restaurant Info & Status */}
      <div className="restaurant-status-card">
        <div className="restaurant-info">
          <h2 className="restaurant-name">
            {currentRestaurant?.name || 'Restoran Adı Belirtilmemiş'}
          </h2>
          <div className="restaurant-stats">
            <span className="stat">
              <strong>{menuStats.totalSections}</strong> Kategori
            </span>
            <span className="stat">
              <strong>{menuStats.totalItems}</strong> Ürün
            </span>
          </div>
        </div>
        
        <div className="status-section">
          <div className="status-info">
            <div className={`status-indicator ${menuStatus}`}>
              {menuStatus === 'active' ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5" />
              )}
            </div>
            <div className="status-text">
              <h3 className="status-title">
                {menuStatus === 'active' ? 'Menü Aktif' : 'Menü Pasif'}
              </h3>
              <p className="status-description">
                {menuStatus === 'active'
                  ? 'Menünüz yayında, herkes görebilir.'
                  : 'Menünüz henüz yayınlanmamış, sadece siz görebilirsiniz.'
                }
              </p>
            </div>
          </div>
          <button
            className={`status-toggle ${menuStatus}`}
            onClick={toggleMenuStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Güncelleniyor...' : (menuStatus === 'active' ? 'Pasif Yap' : 'Aktif Yap')}
          </button>
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
              <h3 className="card-title">Menü İçeriğini Düzenle</h3>
              <p className="card-description">
                Kategoriler, ürünler ve fiyatları düzenleyin
              </p>
            </div>
          </div>
          <button onClick={handleEditContent} className="card-action-btn edit-btn">
            İçeriği Düzenle
          </button>
        </div>

        {/* Design Customization Card */}
        <div className="action-card design-card">
          <div className="card-header">
            <div className="card-icon design-icon">
              <PaintBrushIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">Tasarım Özelleştirme</h3>
              <p className="card-description">
                Menünüzün görünümünü ve stilini özelleştirin
              </p>
            </div>
          </div>
          <button onClick={handleDesignCustomization} className="card-action-btn design-btn">
            Tasarımı Özelleştir
          </button>
        </div>

        {/* View & Share Menu Card */}
        <div className="action-card share-card">
          <div className="card-header">
            <div className="card-icon share-icon">
              <QrCodeIcon className="icon" />
            </div>
            <div className="card-title-section">
              <h3 className="card-title">Menüyü Görüntüle ve Paylaş</h3>
              <p className="card-description">
                QR kod ile menünüzü paylaşın ve önizleyin
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
                  İndir
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
                  title="URL'yi kopyala"
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
                  Önizleme
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
              <h3 className="card-title">Restoran Ayarları</h3>
              <p className="card-description">
                Restoran adı, adres ve iletişim bilgilerini düzenleyin
              </p>
            </div>
          </div>
          <button onClick={handleRestaurantSettings} className="card-action-btn settings-btn">
            Ayarları Düzenle
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuManagementContent;
