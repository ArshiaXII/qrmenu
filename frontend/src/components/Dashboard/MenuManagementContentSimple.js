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
import menuService from '../../services/menuServiceSimple';
import '../../styles/MenuManagement.css';

const MenuManagementContent = () => {
  const navigate = useNavigate();
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const qrCodeRef = useRef(null);

  // Load restaurant data on mount
  useEffect(() => {
    loadRestaurantData();
  }, []);

  const loadRestaurantData = () => {
    const data = menuService.getCurrentUserRestaurant();
    setRestaurantData(data);
  };

  // Generate public URL using custom slug
  const getPublicUrl = () => {
    if (restaurantData && restaurantData.slug) {
      const baseUrl = window.location.origin;
      return `${baseUrl}/menu/${restaurantData.slug}`;
    }
    return `${window.location.origin}/menu/your-restaurant`;
  };

  // Toggle menu status (active/draft)
  const toggleMenuStatus = async () => {
    if (!restaurantData) return;

    setIsLoading(true);
    try {
      const newStatus = restaurantData.status === 'active' ? 'draft' : 'active';
      await menuService.updateMenuStatus(newStatus);
      
      // Reload data to reflect changes
      loadRestaurantData();
    } catch (error) {
      alert('Menü durumu güncellenirken bir hata oluştu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy URL to clipboard
  const handleCopyUrl = async () => {
    const url = getPublicUrl();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
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
      alert('URL kopyalanamadı');
    }
  };

  // Download QR code
  const handleDownloadQR = () => {
    if (!qrCodeRef.current) return;

    const svg = qrCodeRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${restaurantData?.slug || 'menu'}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Preview menu
  const handlePreviewMenu = () => {
    const url = getPublicUrl() + '?preview=true';
    window.open(url, '_blank');
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
  const menuStats = restaurantData?.menu?.sections ? {
    totalSections: restaurantData.menu.sections.length,
    totalItems: restaurantData.menu.sections.reduce((total, section) => total + (section.items?.length || 0), 0)
  } : { totalSections: 0, totalItems: 0 };

  if (!restaurantData) {
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

      {/* Status Card */}
      <div className="status-card">
        <div className="status-content">
          <div className="status-indicator">
            <div className={`status-badge ${restaurantData.status}`}>
              {restaurantData.status === 'active' ? (
                <CheckCircleIcon className="status-icon" />
              ) : (
                <ExclamationTriangleIcon className="status-icon" />
              )}
              <span className="status-text">
                {restaurantData.status === 'active' ? 'Menü Aktif' : 'Menü Pasif'}
              </span>
            </div>
            <p className="status-description">
              {restaurantData.status === 'active'
                ? 'Menünüz yayında, herkes görebilir.'
                : 'Menünüz henüz yayınlanmamış, sadece siz görebilirsiniz.'
              }
            </p>
          </div>
          <button
            className={`status-toggle ${restaurantData.status}`}
            onClick={toggleMenuStatus}
            disabled={isLoading}
          >
            {isLoading ? 'Güncelleniyor...' : (restaurantData.status === 'active' ? 'Pasif Yap' : 'Aktif Yap')}
          </button>
        </div>
      </div>

      {/* Restaurant Stats */}
      <div className="restaurant-stats-section">
        <div className="restaurant-info">
          <h2 className="restaurant-name">
            {restaurantData.name || 'Restaurant'}
          </h2>
          <div className="menu-stats">
            <div className="stat-item">
              <span className="stat-number">{menuStats.totalSections}</span>
              <span className="stat-label">Kategori</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{menuStats.totalItems}</span>
              <span className="stat-label">Ürün</span>
            </div>
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
