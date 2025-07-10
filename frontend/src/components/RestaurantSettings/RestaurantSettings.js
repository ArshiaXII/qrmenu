import React, { useState, useEffect } from 'react';
import { useMenu } from '../../contexts/MenuContext';
import menuService from '../../services/menuService';
import './RestaurantSettings.css';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RestaurantSettings = () => {
  const { currentRestaurant, loadDashboardMenuData } = useMenu();
  const [restaurantName, setRestaurantName] = useState('');
  const [slugPreview, setSlugPreview] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load current restaurant name
  useEffect(() => {
    if (currentRestaurant && currentRestaurant.name) {
      setRestaurantName(currentRestaurant.name);
    }
  }, [currentRestaurant]);

  // Generate slug preview when name changes
  useEffect(() => {
    if (restaurantName.trim()) {
      const generatedSlug = generateSlugFromName(restaurantName);
      setSlugPreview(generatedSlug);
    } else {
      setSlugPreview('');
    }
  }, [restaurantName]);

  // Simple slug generation function
  const generateSlugFromName = (name) => {
    return name
      .toLowerCase()
      .trim()
      // Replace Turkish characters
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      // Replace spaces and special characters with hyphens
      .replace(/[^a-z0-9]/g, '-')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setRestaurantName(newName);
    setNameError('');
    setSuccessMessage('');

    // Check name uniqueness if not empty
    if (newName.trim()) {
      menuService.checkRestaurantNameUnique(newName).then(isUnique => {
        if (!isUnique) {
          setNameError('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
        }
      }).catch(error => {
        console.error('Error checking name uniqueness:', error);
      });
    }
  };

  const handleSave = async () => {
    if (!restaurantName.trim()) {
      setNameError('Restoran adı gereklidir.');
      return;
    }

    if (nameError) {
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      const oldSlug = currentRestaurant?.slug;

      const result = await menuService.updateRestaurantSettings(restaurantName, null, {
        address: 'İstanbul, Türkiye',
        phone: '+90 212 555 0123',
        hours: '09:00 - 23:00'
      });

      if (result.newSlug && result.newSlug !== oldSlug) {
        setSuccessMessage(`Restoran ayarları başarıyla güncellendi! Yeni URL: /menu/${result.newSlug}`);
      } else {
        setSuccessMessage('Restoran ayarları başarıyla güncellendi!');
      }

      // Reload dashboard data to reflect changes
      await loadDashboardMenuData();

    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      if (error.message === 'RESTAURANT_NAME_EXISTS') {
        setNameError('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
      } else {
        setNameError('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPublicUrl = () => {
    const baseUrl = window.location.origin;
    const currentSlug = slugPreview || 'your-restaurant';
    return `${baseUrl}/menu/${currentSlug}`;
  };

  return (
    <div className="restaurant-settings">
      <div className="settings-header">
        <div className="header-content">
          <BuildingStorefrontIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="page-title">Restoran Ayarları</h1>
            <p className="page-subtitle">Restoran adınızı belirleyin ve özel URL'nizi oluşturun</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* Restaurant Name */}
        <div className="settings-card">
          <h2 className="card-title">Restoran Adı</h2>

          <div className="form-group">
            <label className="form-label">
              Restoran Adı *
              {nameError && <span className="error-text">({nameError})</span>}
            </label>
            <input
              type="text"
              value={restaurantName}
              onChange={handleNameChange}
              className={`form-input ${nameError ? 'error' : ''}`}
              placeholder="Restoran adınızı girin"
              maxLength={100}
            />
            {!nameError && restaurantName && (
              <div className="success-text">
                <CheckCircleIcon className="w-4 h-4" />
                Bu ad kullanılabilir
              </div>
            )}
          </div>
        </div>

        {/* URL Preview */}
        {slugPreview && (
          <div className="settings-card">
            <h2 className="card-title">Menü URL'niz</h2>

            {/* Current URL */}
            {currentRestaurant?.slug && currentRestaurant.slug !== slugPreview && (
              <div className="url-preview">
                <label className="form-label">Mevcut URL</label>
                <div className="url-display">
                  <span className="url-text">{window.location.origin}/menu/{currentRestaurant.slug}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/menu/${currentRestaurant.slug}`)}
                    className="copy-btn"
                    title="Mevcut URL'yi kopyala"
                  >
                    Kopyala
                  </button>
                </div>
              </div>
            )}

            {/* New URL Preview */}
            <div className="url-preview">
              <label className="form-label">
                {currentRestaurant?.slug && currentRestaurant.slug !== slugPreview ? 'Yeni URL (Kaydettikten sonra)' : 'Menü URL\'niz'}
              </label>
              <div className="url-display">
                <span className="url-text">{getCurrentPublicUrl()}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(getCurrentPublicUrl())}
                  className="copy-btn"
                  title="URL'yi kopyala"
                >
                  Kopyala
                </button>
              </div>
              {currentRestaurant?.slug && currentRestaurant.slug !== slugPreview && (
                <p className="text-sm text-amber-600 mt-2">
                  ⚠️ Restoran adını değiştirdiğinizde URL'niz de değişecek
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <CheckCircleIcon className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Save Button */}
        <div className="settings-actions">
          <button
            onClick={handleSave}
            disabled={isLoading || !!nameError || !restaurantName.trim()}
            className="save-btn"
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Ayarları Kaydet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;
