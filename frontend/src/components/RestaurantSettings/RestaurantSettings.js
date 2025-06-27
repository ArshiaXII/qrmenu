import React, { useState, useEffect } from 'react';
import { useMenu } from '../../contexts/MenuContext';
import menuService from '../../services/menuService';
import './RestaurantSettings.css';
import { 
  BuildingStorefrontIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RestaurantSettings = () => {
  const { currentRestaurant, loadDashboardMenuData } = useMenu();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    hours: ''
  });
  const [customSlug, setCustomSlug] = useState('');
  const [slugPreview, setSlugPreview] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load current restaurant data
  useEffect(() => {
    if (currentRestaurant) {
      setFormData({
        name: currentRestaurant.name || '',
        address: currentRestaurant.address || '',
        phone: currentRestaurant.phone || '',
        hours: currentRestaurant.hours || ''
      });
      setCustomSlug(currentRestaurant.slug || '');
    }
  }, [currentRestaurant]);

  // Generate slug preview when name changes
  useEffect(() => {
    if (formData.name.trim()) {
      const generatedSlug = menuService.generateSlugFromName(formData.name);
      setSlugPreview(generatedSlug);
    } else {
      setSlugPreview('');
    }
  }, [formData.name]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData(prev => ({ ...prev, name: newName }));
    setNameError('');
    setSuccessMessage('');

    // Check name uniqueness if not empty
    if (newName.trim()) {
      const isUnique = menuService.isRestaurantNameUnique(newName, true); // Exclude current user
      if (!isUnique) {
        setNameError('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setNameError('Restoran adı gereklidir.');
      return;
    }

    if (nameError) {
      return; // Don't save if there's a name error
    }

    setIsLoading(true);
    setSuccessMessage('');

    try {
      console.log('🔍 [RestaurantSettings] Saving restaurant settings...');
      
      // Generate new custom slug from name
      const newCustomSlug = menuService.generateSlugFromName(formData.name);
      console.log('🔍 [RestaurantSettings] Generated new slug:', newCustomSlug);

      // Update restaurant data
      const updateData = {
        restaurant: {
          ...currentRestaurant,
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          hours: formData.hours.trim(),
          slug: newCustomSlug // Update to new custom slug
        }
      };

      console.log('🔍 [RestaurantSettings] Updating with data:', updateData);

      // Save using menuService
      await menuService.updateRestaurantSettings(updateData.restaurant);
      
      // Update local state
      setCustomSlug(newCustomSlug);
      setSuccessMessage('Restoran ayarları başarıyla güncellendi!');
      
      // Reload dashboard data to reflect changes
      await loadDashboardMenuData();
      
      console.log('✅ [RestaurantSettings] Restaurant settings saved successfully');
    } catch (error) {
      console.error('❌ [RestaurantSettings] Error saving restaurant settings:', error);
      setNameError('Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPublicUrl = () => {
    const baseUrl = window.location.origin;
    const currentSlug = customSlug || slugPreview || 'your-restaurant';
    return `${baseUrl}/menu/${currentSlug}`;
  };

  return (
    <div className="restaurant-settings">
      <div className="settings-header">
        <div className="header-content">
          <BuildingStorefrontIcon className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="page-title">Restoran Ayarları</h1>
            <p className="page-subtitle">Restoran bilgilerinizi ve özel URL'nizi yönetin</p>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* Restaurant Information */}
        <div className="settings-card">
          <h2 className="card-title">Restoran Bilgileri</h2>
          
          <div className="form-group">
            <label className="form-label">
              Restoran Adı *
              {nameError && <span className="error-text">({nameError})</span>}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              className={`form-input ${nameError ? 'error' : ''}`}
              placeholder="Restoran adınızı girin"
              maxLength={100}
            />
            {!nameError && formData.name && (
              <div className="success-text">
                <CheckCircleIcon className="w-4 h-4" />
                Bu ad kullanılabilir
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Adres</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="form-input"
              placeholder="Restoran adresinizi girin"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input"
                placeholder="+90 212 555 0123"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Çalışma Saatleri</label>
              <input
                type="text"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                className="form-input"
                placeholder="09:00 - 23:00"
              />
            </div>
          </div>
        </div>

        {/* Custom URL Settings */}
        <div className="settings-card">
          <h2 className="card-title">
            <LinkIcon className="w-5 h-5" />
            Özel URL Ayarları
          </h2>
          
          <div className="url-preview">
            <label className="form-label">Mevcut Menü URL'niz</label>
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
          </div>

          {slugPreview && slugPreview !== customSlug && (
            <div className="slug-preview">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              <div>
                <p className="preview-title">Yeni URL Önizlemesi</p>
                <p className="preview-url">{window.location.origin}/menu/{slugPreview}</p>
                <p className="preview-note">
                  Restoran adını değiştirdiğinizde URL'niz otomatik olarak güncellenecek
                </p>
              </div>
            </div>
          )}
        </div>

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
            disabled={isLoading || !!nameError || !formData.name.trim()}
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
