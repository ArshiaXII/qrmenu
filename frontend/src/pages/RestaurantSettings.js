import React, { useState, useEffect } from 'react';
import { useMenu } from '../contexts/MenuContext';
import './RestaurantSettings.css';

// Currency options with symbols
const CURRENCY_OPTIONS = [
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' }
];

const RestaurantSettings = () => {
  const {
    currentRestaurant,
    isLoading,
    loadDashboardMenuData,
    saveRestaurantSettings,
    checkRestaurantNameUnique,
    updateRestaurantName
  } = useMenu();

  const [settings, setSettings] = useState({
    currency: 'TRY',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    }
  });
  const [restaurantName, setRestaurantName] = useState('');
  const [nameValidation, setNameValidation] = useState({ isValid: true, message: '' });
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load restaurant data when component mounts
  useEffect(() => {
    loadDashboardMenuData(); // Remove hardcoded slug
  }, [loadDashboardMenuData]);

  // Update local state when restaurant data loads
  useEffect(() => {
    if (currentRestaurant) {
      setRestaurantName(currentRestaurant.name || '');
      setSettings({
        currency: currentRestaurant.currency || 'TRY',
        socialMedia: {
          instagram: currentRestaurant.socialMedia?.instagram || '',
          facebook: currentRestaurant.socialMedia?.facebook || '',
          twitter: currentRestaurant.socialMedia?.twitter || ''
        }
      });
    }
  }, [currentRestaurant]);

  // Handle restaurant name change with validation
  const handleRestaurantNameChange = async (e) => {
    const newName = e.target.value;
    setRestaurantName(newName);
    setHasUnsavedChanges(true);

    // Reset validation state
    setNameValidation({ isValid: true, message: '' });

    // Skip validation for empty names or if name hasn't changed
    if (!newName.trim() || newName === currentRestaurant?.name) {
      return;
    }

    // Debounce validation check
    setIsCheckingName(true);
    setTimeout(async () => {
      try {
        const isUnique = await checkRestaurantNameUnique(newName.trim());
        if (!isUnique) {
          setNameValidation({
            isValid: false,
            message: 'Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.'
          });
        } else {
          setNameValidation({ isValid: true, message: '' });
        }
      } catch (error) {
        console.error('Error checking name uniqueness:', error);
        setNameValidation({
          isValid: false,
          message: 'Ad kontrolü yapılırken hata oluştu.'
        });
      } finally {
        setIsCheckingName(false);
      }
    }, 500); // 500ms debounce
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setSettings(prev => ({
      ...prev,
      currency: newCurrency
    }));
    setHasUnsavedChanges(true);
  };

  // Handle social media link changes
  const handleSocialMediaChange = (platform, value) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save settings
  const handleSaveSettings = async () => {
    // Check if name validation failed
    if (!nameValidation.isValid) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    try {
      setSaveStatus('saving');

      // Save restaurant name if it changed
      if (restaurantName.trim() && restaurantName !== currentRestaurant?.name) {
        await updateRestaurantName(restaurantName.trim());
      }

      // Save other settings
      await saveRestaurantSettings(settings);

      setHasUnsavedChanges(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);

      // Handle specific error types
      if (error.message === 'RESTAURANT_NAME_EXISTS') {
        setNameValidation({
          isValid: false,
          message: 'Bu restoran adı zaten kullanılıyor. Lütfen farklı bir ad seçin.'
        });
      }

      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // Get currency symbol for display
  const getCurrencySymbol = (currencyCode) => {
    const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };


  // Show loading state
  if (isLoading && !currentRestaurant) {
    return (
      <div className="restaurant-settings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Ayarlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-settings">
      <div className="settings-header">
        <h1>Restoran Ayarları</h1>
        <p>Para birimi ve sosyal medya bağlantılarınızı yönetin</p>
      </div>

      {/* Save Status Messages */}
      {saveStatus === 'success' && (
        <div className="status-message success">
          ✅ Ayarlar başarıyla kaydedildi!
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="status-message error">
          ❌ Ayarlar kaydedilirken hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}

      <div className="settings-content">
        {/* Restaurant Name Section */}
        <div className="settings-section">
          <h2>Restoran Bilgileri</h2>
          <p className="section-description">
            Restoran adınızı ve temel bilgilerinizi yönetin
          </p>

          <div className="form-group">
            <label htmlFor="restaurantName">Restoran Adı</label>
            <input
              type="text"
              id="restaurantName"
              value={restaurantName}
              onChange={handleRestaurantNameChange}
              placeholder="Restoran adınızı girin"
              className={`form-input ${!nameValidation.isValid ? 'error' : ''}`}
              required
            />
            {isCheckingName && (
              <div className="validation-message checking">
                ⏳ Ad kontrolü yapılıyor...
              </div>
            )}
            {!nameValidation.isValid && (
              <div className="validation-message error">
                ❌ {nameValidation.message}
              </div>
            )}
            {nameValidation.isValid && restaurantName && restaurantName !== currentRestaurant?.name && !isCheckingName && (
              <div className="validation-message success">
                ✅ Bu ad kullanılabilir
              </div>
            )}
          </div>
        </div>

        {/* Currency Settings Section */}
        <div className="settings-section">
          <h2>Para Birimi</h2>
          <p className="section-description">
            Menünüzde görüntülenecek para birimini seçin
          </p>

          <div className="form-group">
            <label htmlFor="currency">Para Birimi</label>
            <select
              id="currency"
              value={settings.currency}
              onChange={handleCurrencyChange}
              className="form-select"
            >
              {CURRENCY_OPTIONS.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} ({currency.symbol}) - {currency.name}
                </option>
              ))}
            </select>
            <div className="currency-preview">
              Örnek fiyat: {getCurrencySymbol(settings.currency)}25.00
            </div>
          </div>
        </div>

        {/* Social Media Links Section */}
        <div className="settings-section">
          <h2>Sosyal Medya Bağlantıları</h2>
          <p className="section-description">
            Sosyal medya hesaplarınızın bağlantılarını ekleyin
          </p>

          <div className="social-media-inputs">
            <div className="form-group">
              <label htmlFor="instagram">Instagram URL</label>
              <input
                type="url"
                id="instagram"
                value={settings.socialMedia.instagram}
                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                placeholder="https://instagram.com/restoraniniz"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="facebook">Facebook URL</label>
              <input
                type="url"
                id="facebook"
                value={settings.socialMedia.facebook}
                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                placeholder="https://facebook.com/restoraniniz"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="twitter">Twitter/X URL</label>
              <input
                type="url"
                id="twitter"
                value={settings.socialMedia.twitter}
                onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                placeholder="https://twitter.com/restoraniniz"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button
            onClick={handleSaveSettings}
            disabled={!hasUnsavedChanges || saveStatus === 'saving' || !nameValidation.isValid || isCheckingName}
            className={`save-button ${(!hasUnsavedChanges || !nameValidation.isValid) ? 'disabled' : ''}`}
          >
            {saveStatus === 'saving' ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>

          {hasUnsavedChanges && (
            <p className="unsaved-changes">Kaydedilmemiş değişiklikler var</p>
          )}

          {!nameValidation.isValid && (
            <p className="validation-error">Lütfen geçerli bir restoran adı girin</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;
