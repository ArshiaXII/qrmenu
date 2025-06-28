import React, { useState, useEffect } from 'react';
import { useMenu } from '../../contexts/MenuContext';
import menuService from '../../services/menuServiceFinal';
import './RestaurantSettings.css';
import { 
  BuildingStorefrontIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const RestaurantSettings = () => {
  const { loadDashboardMenuData } = useMenu();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    hours: ''
  });
  
  // UI state
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [slugPreview, setSlugPreview] = useState('');

  // Load current restaurant data on mount
  useEffect(() => {
    const currentRestaurant = menuService.getCurrentUserRestaurant();
    if (currentRestaurant) {
      setFormData({
        name: currentRestaurant.name || '',
        address: currentRestaurant.address || '',
        phone: currentRestaurant.phone || '',
        hours: currentRestaurant.hours || ''
      });
    }
  }, []);

  // Generate slug preview when name changes
  useEffect(() => {
    if (formData.name.trim()) {
      const generatedSlug = menuService.generateSlugFromName(formData.name);
      setSlugPreview(generatedSlug);
    } else {
      setSlugPreview('');
    }
  }, [formData.name]);

  // Handle name change with uniqueness validation
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData(prev => ({ ...prev, name: newName }));
    setNameError('');
    setSuccessMessage('');

    // Check name uniqueness if not empty
    if (newName.trim()) {
      const isUnique = menuService.isRestaurantNameUnique(newName);
      if (!isUnique) {
        setNameError('Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.');
      }
    }
  };

  // Handle other field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage('');
  };

  // Handle form submission
  const handleSave = async () => {
    // Validation
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
      // Save restaurant settings
      await menuService.saveRestaurantSettings(
        formData.name.trim(),
        formData.address.trim(),
        formData.phone.trim(),
        formData.hours.trim()
      );
      
      setSuccessMessage('Restoran ayarları başarıyla güncellendi!');
      
      // Reload dashboard data to reflect changes
      if (loadDashboardMenuData) {
        await loadDashboardMenuData();
      }
      
    } catch (error) {
      console.error('Error saving restaurant settings:', error);
      setNameError(error.message || 'Ayarlar kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current public URL
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
              onChange={(e) => handleFieldChange('address', e.target.value)}
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
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="form-input"
                placeholder="+90 212 555 0123"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Çalışma Saatleri</label>
              <input
                type="text"
                value={formData.hours}
                onChange={(e) => handleFieldChange('hours', e.target.value)}
                className="form-input"
                placeholder="09:00 - 23:00"
              />
            </div>
          </div>
        </div>

        {/* URL Preview */}
        {slugPreview && (
          <div className="settings-card">
            <h2 className="card-title">Menü URL'niz</h2>
            
            <div className="url-preview">
              <label className="form-label">Menü URL'niz</label>
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
