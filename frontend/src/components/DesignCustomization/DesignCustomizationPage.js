import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  WifiIcon,
  Battery100Icon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useMenu } from '../../contexts/MenuContext';
import menuService from '../../services/menuService';
import './DesignCustomizationPage.css';

// Predefined background themes
const BACKGROUND_THEMES = [
  {
    id: 'light-wood',
    name: 'Açık Ahşap',
    preview: 'linear-gradient(45deg, #f5f5dc 25%, #f0e68c 25%, #f0e68c 50%, #f5f5dc 50%, #f5f5dc 75%, #f0e68c 75%)',
    style: {
      backgroundImage: 'linear-gradient(45deg, #f5f5dc 25%, #f0e68c 25%, #f0e68c 50%, #f5f5dc 50%, #f5f5dc 75%, #f0e68c 75%)',
      backgroundSize: '20px 20px'
    }
  },
  {
    id: 'marble',
    name: 'Mermer',
    preview: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    style: {
      backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }
  },
  {
    id: 'subtle-pattern',
    name: 'İnce Desen',
    preview: 'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.15) 1px, transparent 0)',
    style: {
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(139,92,246,0.15) 1px, transparent 0)',
      backgroundSize: '20px 20px'
    }
  },
  {
    id: 'warm-gradient',
    name: 'Sıcak Gradyan',
    preview: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    style: {
      backgroundImage: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    }
  },
  {
    id: 'cool-gradient',
    name: 'Soğuk Gradyan',
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    style: {
      backgroundImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  },
  {
    id: 'elegant-dark',
    name: 'Zarif Koyu',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    style: {
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  }
];

const DesignCustomizationPage = () => {
  const navigate = useNavigate();
  const logoInputRef = useRef(null);
  const backgroundImageInputRef = useRef(null);
  const {
    currentBranding,
    currentRestaurant,
    loadDashboardMenuData,
    saveDesignCustomization,
    isLoading
  } = useMenu();

  // Get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currencyMap = {
      'TRY': '₺',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return currencyMap[currencyCode] || currencyCode;
  };

  const currencySymbol = getCurrencySymbol(currentRestaurant?.currency || 'TRY');

  // State management
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [colors, setColors] = useState({
    textColor: '#1f2937',      // Default dark gray
    backgroundColor: '#ffffff', // Default white
    accentColor: '#8b5cf6'     // Default purple
  });

  // Advanced background customization
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
  const [backgroundSettings, setBackgroundSettings] = useState({
    repeat: 'no-repeat',
    size: 'cover',
    position: 'center center',
    opacity: 100
  });
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Card styling
  const [cardStyles, setCardStyles] = useState({
    backgroundColor: '#ffffff',
    backgroundOpacity: 95,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    shadow: true,
    cornerRadius: 8
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load existing branding data when component mounts
  useEffect(() => {
    loadDashboardMenuData();
  }, [loadDashboardMenuData]);

  // Update local state when branding data loads
  useEffect(() => {
    if (currentBranding) {
      // Only update colors if they exist, otherwise keep defaults
      if (currentBranding.colors) {
        setColors(currentBranding.colors);
      }
      if (currentBranding.logo) {
        setLogoPreview(currentBranding.logo);
      }
      if (currentBranding.backgroundImage) {
        setBackgroundImagePreview(currentBranding.backgroundImage);
      }
      if (currentBranding.backgroundSettings) {
        setBackgroundSettings(currentBranding.backgroundSettings);
      }
      if (currentBranding.overlayColor) {
        setOverlayColor(currentBranding.overlayColor);
      }
      if (currentBranding.overlayOpacity !== undefined) {
        setOverlayOpacity(currentBranding.overlayOpacity);
      }
      if (currentBranding.selectedTheme) {
        setSelectedTheme(currentBranding.selectedTheme);
      }
      if (currentBranding.cardStyles) {
        setCardStyles(currentBranding.cardStyles);
      }
    }
  }, [currentBranding]);

  // Save design data to backend
  const saveDesignData = async () => {
    try {
      const brandingData = {
        logo: logo && typeof logo === 'string' ? logo : logoPreview,
        colors: colors,
        backgroundImage: backgroundImage && typeof backgroundImage === 'string' ? backgroundImage : backgroundImagePreview,
        backgroundSettings: backgroundSettings,
        overlayColor: overlayColor,
        overlayOpacity: overlayOpacity,
        selectedTheme: selectedTheme,
        cardStyles: cardStyles
      };

      await saveDesignCustomization(brandingData);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Failed to save design customization:', error);
    }
  };

  // Logo upload handler
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Upload logo and get URL
        const uploadResult = await menuService.uploadImage(file, 'logo');
        const logoUrl = uploadResult.imageUrl;

        setLogo(logoUrl);
        setLogoPreview(logoUrl);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Failed to upload logo:', error);
        // Fallback to local preview
        setLogo(file);
        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
        setHasUnsavedChanges(true);
      }
    }
  };

  // Logo remove handler
  const handleLogoRemove = () => {
    setLogo(null);
    if (logoPreview && logoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
    setHasUnsavedChanges(true);
  };

  // Color change handler
  const handleColorChange = (colorType, value) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Background image upload handler
  const handleBackgroundImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        // Upload background image and get URL
        const uploadResult = await menuService.uploadImage(file, 'background');
        const imageUrl = uploadResult.imageUrl;

        setBackgroundImage(imageUrl);
        setBackgroundImagePreview(imageUrl);
        setSelectedTheme(null); // Clear theme when custom image is uploaded
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Failed to upload background image:', error);
        // Fallback to local preview
        setBackgroundImage(file);
        const previewUrl = URL.createObjectURL(file);
        setBackgroundImagePreview(previewUrl);
        setSelectedTheme(null);
        setHasUnsavedChanges(true);
      }
    }
  };

  // Background image remove handler
  const handleBackgroundImageRemove = () => {
    setBackgroundImage(null);
    if (backgroundImagePreview && backgroundImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(backgroundImagePreview);
    }
    setBackgroundImagePreview(null);
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
    setHasUnsavedChanges(true);
  };

  // Background settings change handler
  const handleBackgroundSettingChange = (setting, value) => {
    setBackgroundSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Theme selection handler
  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setBackgroundImage(null);
    setBackgroundImagePreview(null);
    if (backgroundImageInputRef.current) {
      backgroundImageInputRef.current.value = '';
    }
    setHasUnsavedChanges(true);
  };

  // Card style change handler
  const handleCardStyleChange = (property, value) => {
    setCardStyles(prev => ({
      ...prev,
      [property]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Navigation handlers
  const handleBack = () => {
    // Check if we came from menu creation or directly from menu management
    const referrer = sessionStorage.getItem('designCustomizationReferrer');
    if (referrer === 'menu-creation') {
      navigate('/dashboard/menu/create');
    } else {
      // Default to menu management if accessed directly
      navigate('/dashboard/menu-management');
    }
  };

  const handleNext = async () => {
    // Save customization data and return to menu management
    await saveDesignData();
    // Clear the referrer since we're completing the flow
    sessionStorage.removeItem('designCustomizationReferrer');
    // Navigate back to menu management hub
    navigate('/dashboard/menu-management');
  };

  const handleSkip = () => {
    // Skip customization and go to menu management
    sessionStorage.removeItem('designCustomizationReferrer');
    navigate('/dashboard/menu-management');
  };

  // Ensure colors is never undefined
  const safeColors = colors || {
    textColor: '#1f2937',
    backgroundColor: '#ffffff',
    accentColor: '#8b5cf6'
  };

  return (
    <div className="design-customization-page">
      {/* Progress Indicator */}
      <div className="progress-indicator">
        <div className="progress-step completed">
          <span className="step-number">✓</span>
          <span className="step-text">Menü Oluştur</span>
        </div>
        <div className="progress-step active">
          <span className="step-number">2</span>
          <span className="step-text">Tasarımı Özelleştir</span>
        </div>
      </div>

      <div className="customization-content">
        {/* Left Column - Customization Controls */}
        <div className="customization-controls">
          <div className="controls-header">
            <h1>Markanızın görünümünü özelleştirin</h1>
            <p>Menünüzün görsel kimliğini oluşturun. Logo ve renk seçimleriniz müşterilerinizin ilk izlenimini belirler.</p>
          </div>

          {/* Logo Upload Section */}
          <div className="customization-section">
            <h3>Logo</h3>
            <div className="logo-upload-area">
              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoUpload}
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: 'none' }}
              />
              
              {logoPreview ? (
                <div className="logo-preview">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    onError={(e) => {
                      console.error('Logo preview failed to load');
                      handleLogoRemove();
                    }}
                  />
                  <button
                    onClick={handleLogoRemove}
                    className="remove-logo-btn"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="upload-logo-btn"
                  type="button"
                >
                  <ArrowUpTrayIcon className="upload-icon" />
                  <span>Yükle</span>
                </button>
              )}
            </div>
            <p className="file-hint">.jpg, .jpeg, .png</p>
          </div>

          {/* Color Selection Section */}
          <div className="customization-section">
            <h3>Renkler</h3>
            
            <div className="color-controls">
              <div className="color-control">
                <label>Metin Rengi</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={safeColors.textColor}
                    onChange={(e) => handleColorChange('textColor', e.target.value)}
                    className="color-picker"
                  />
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: safeColors.textColor }}
                  ></div>
                  <span className="color-value">{safeColors.textColor}</span>
                </div>
              </div>

              <div className="color-control">
                <label>Arka Plan Rengi</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={safeColors.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="color-picker"
                  />
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: safeColors.backgroundColor }}
                  ></div>
                  <span className="color-value">{safeColors.backgroundColor}</span>
                </div>
              </div>

              <div className="color-control">
                <label>Vurgu Rengi</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={safeColors.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="color-picker"
                  />
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: safeColors.accentColor }}
                  ></div>
                  <span className="color-value">{safeColors.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Customization Section */}
          <div className="customization-section">
            <h3>Arka Plan</h3>

            {/* Background Image Upload */}
            <div className="background-upload-area">
              <h4>Özel Arka Plan Resmi</h4>
              <input
                type="file"
                ref={backgroundImageInputRef}
                onChange={handleBackgroundImageUpload}
                accept="image/jpeg,image/jpg,image/png"
                style={{ display: 'none' }}
              />

              {backgroundImagePreview ? (
                <div className="background-preview">
                  <img
                    src={backgroundImagePreview}
                    alt="Background Preview"
                    className="background-preview-image"
                  />
                  <button
                    onClick={handleBackgroundImageRemove}
                    className="remove-background-btn"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => backgroundImageInputRef.current?.click()}
                  className="upload-background-btn"
                  type="button"
                >
                  <ArrowUpTrayIcon className="upload-icon" />
                  <span>Arka Plan Resmi Yükle</span>
                </button>
              )}
              <p className="file-hint">Önerilen: 1920x1080px veya benzer manzara oranı</p>
            </div>

            {/* Background Image Settings */}
            {backgroundImagePreview && (
              <div className="background-settings">
                <div className="setting-group">
                  <label>Tekrar</label>
                  <select
                    value={backgroundSettings.repeat}
                    onChange={(e) => handleBackgroundSettingChange('repeat', e.target.value)}
                    className="setting-select"
                  >
                    <option value="no-repeat">Tekrar Etme</option>
                    <option value="repeat">Tekrar Et</option>
                    <option value="repeat-x">Yatay Tekrar</option>
                    <option value="repeat-y">Dikey Tekrar</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Boyut</label>
                  <select
                    value={backgroundSettings.size}
                    onChange={(e) => handleBackgroundSettingChange('size', e.target.value)}
                    className="setting-select"
                  >
                    <option value="cover">Kapla (Önerilen)</option>
                    <option value="contain">Sığdır</option>
                    <option value="auto">Otomatik</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Pozisyon</label>
                  <select
                    value={backgroundSettings.position}
                    onChange={(e) => handleBackgroundSettingChange('position', e.target.value)}
                    className="setting-select"
                  >
                    <option value="center center">Merkez</option>
                    <option value="top left">Sol Üst</option>
                    <option value="top center">Üst Merkez</option>
                    <option value="top right">Sağ Üst</option>
                    <option value="center left">Sol Merkez</option>
                    <option value="center right">Sağ Merkez</option>
                    <option value="bottom left">Sol Alt</option>
                    <option value="bottom center">Alt Merkez</option>
                    <option value="bottom right">Sağ Alt</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label>Resim Şeffaflığı: {backgroundSettings.opacity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={backgroundSettings.opacity}
                    onChange={(e) => handleBackgroundSettingChange('opacity', parseInt(e.target.value))}
                    className="opacity-slider"
                  />
                </div>

                <div className="setting-group">
                  <label>Kaplama Rengi</label>
                  <div className="overlay-controls">
                    <input
                      type="color"
                      value={overlayColor}
                      onChange={(e) => setOverlayColor(e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={overlayOpacity}
                      onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                      className="opacity-slider"
                    />
                    <span className="opacity-label">{overlayOpacity}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Predefined Themes */}
            <div className="theme-gallery">
              <h4>Hazır Temalar</h4>
              <div className="theme-grid">
                {BACKGROUND_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    className={`theme-swatch ${selectedTheme?.id === theme.id ? 'selected' : ''}`}
                    onClick={() => handleThemeSelect(theme)}
                    style={{ background: theme.preview }}
                    title={theme.name}
                  >
                    <span className="theme-name">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card Styling Section */}
          <div className="customization-section">
            <h3>Kart Stilleri</h3>

            <div className="card-style-controls">
              <div className="setting-group">
                <label>Kart Arka Plan Rengi</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    value={cardStyles.backgroundColor}
                    onChange={(e) => handleCardStyleChange('backgroundColor', e.target.value)}
                    className="color-picker"
                  />
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: cardStyles.backgroundColor }}
                  ></div>
                </div>
              </div>

              <div className="setting-group">
                <label>Kart Şeffaflığı: {cardStyles.backgroundOpacity}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cardStyles.backgroundOpacity}
                  onChange={(e) => handleCardStyleChange('backgroundOpacity', parseInt(e.target.value))}
                  className="opacity-slider"
                />
              </div>

              <div className="setting-group">
                <label>Kenarlık</label>
                <div className="border-controls">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={cardStyles.borderWidth}
                    onChange={(e) => handleCardStyleChange('borderWidth', parseInt(e.target.value))}
                    className="border-slider"
                  />
                  <span>{cardStyles.borderWidth}px</span>
                  <select
                    value={cardStyles.borderStyle}
                    onChange={(e) => handleCardStyleChange('borderStyle', e.target.value)}
                    className="border-style-select"
                  >
                    <option value="solid">Düz</option>
                    <option value="dashed">Kesikli</option>
                    <option value="dotted">Noktalı</option>
                  </select>
                  <input
                    type="color"
                    value={cardStyles.borderColor}
                    onChange={(e) => handleCardStyleChange('borderColor', e.target.value)}
                    className="color-picker small"
                  />
                </div>
              </div>

              <div className="setting-group">
                <label>Köşe Yuvarlaklığı: {cardStyles.cornerRadius}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={cardStyles.cornerRadius}
                  onChange={(e) => handleCardStyleChange('cornerRadius', parseInt(e.target.value))}
                  className="radius-slider"
                />
              </div>

              <div className="setting-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={cardStyles.shadow}
                    onChange={(e) => handleCardStyleChange('shadow', e.target.checked)}
                  />
                  Gölge Efekti
                </label>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="navigation-controls">
            <button onClick={handleBack} className="back-btn">
              <ArrowLeftIcon className="w-5 h-5" />
              Geri
            </button>
            
            <div className="right-controls">
              <button onClick={handleSkip} className="skip-link">
                Geç, sonra yapacağım.
              </button>
              <button
                onClick={handleNext}
                className="next-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Kaydediliyor...' : 'Sonraki'}
                {!isLoading && <ArrowRightIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Mobile Preview */}
        <div className="mobile-preview">
          <div className="phone-frame">
            <div className="phone-header">
              <div className="status-bar">
                <span className="time">15:55</span>
                <div className="status-icons">
                  <WifiIcon className="status-icon" />
                  <Battery100Icon className="status-icon" />
                </div>
              </div>
            </div>

            <div
              className="phone-content"
              style={{
                backgroundColor: safeColors.backgroundColor,
                ...(backgroundImagePreview && {
                  backgroundImage: `url(${backgroundImagePreview})`,
                  backgroundRepeat: backgroundSettings.repeat,
                  backgroundSize: backgroundSettings.size,
                  backgroundPosition: backgroundSettings.position,
                  opacity: backgroundSettings.opacity / 100
                }),
                ...(selectedTheme && selectedTheme.style),
                position: 'relative'
              }}
            >
              {/* Background Overlay */}
              {(backgroundImagePreview || selectedTheme) && overlayOpacity > 0 && (
                <div
                  className="background-overlay"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: overlayColor,
                    opacity: overlayOpacity / 100,
                    pointerEvents: 'none'
                  }}
                />
              )}
              {/* Logo Section */}
              <div className="preview-logo-section">
                {logoPreview ? (
                  <>
                    <img
                      src={logoPreview}
                      alt="Restaurant Logo"
                      className="preview-logo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="preview-logo-placeholder" style={{ display: 'none' }}>
                      <PhotoIcon className="placeholder-icon" />
                    </div>
                  </>
                ) : (
                  <div className="preview-logo-placeholder">
                    <PhotoIcon className="placeholder-icon" />
                  </div>
                )}
              </div>

              {/* Restaurant Name */}
              <div className="preview-restaurant-name">
                <h2 style={{ color: safeColors.textColor }}>{currentRestaurant?.name || 'Restaurant Adı'}</h2>
              </div>

              {/* Language Selector */}
              <div className="preview-language-selector">
                <span style={{ color: safeColors.textColor }}>Türkçe</span>
                <ChevronDownIcon className="dropdown-icon" style={{ color: safeColors.textColor }} />
              </div>

              {/* Main Menu Button */}
              <button
                className="preview-menu-button"
                style={{
                  backgroundColor: safeColors.accentColor,
                  color: safeColors.textColor
                }}
              >
                Menüye Giriş
              </button>

              {/* Sample Menu Cards */}
              <div className="preview-menu-cards">
                <div
                  className="preview-menu-card"
                  style={{
                    backgroundColor: `rgba(${parseInt(cardStyles.backgroundColor.slice(1, 3), 16)}, ${parseInt(cardStyles.backgroundColor.slice(3, 5), 16)}, ${parseInt(cardStyles.backgroundColor.slice(5, 7), 16)}, ${cardStyles.backgroundOpacity / 100})`,
                    border: `${cardStyles.borderWidth}px ${cardStyles.borderStyle} ${cardStyles.borderColor}`,
                    borderRadius: `${cardStyles.cornerRadius}px`,
                    boxShadow: cardStyles.shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <h4 style={{ color: safeColors.textColor, margin: '0 0 8px 0' }}>Ana Yemekler</h4>
                  <div className="preview-menu-item">
                    <span style={{ color: safeColors.textColor, fontSize: '14px' }}>Izgara Somon</span>
                    <span style={{ color: safeColors.accentColor, fontSize: '14px', fontWeight: 'bold' }}>{currencySymbol}85</span>
                  </div>
                  <div className="preview-menu-item">
                    <span style={{ color: safeColors.textColor, fontSize: '14px' }}>Kuzu Pirzola</span>
                    <span style={{ color: safeColors.accentColor, fontSize: '14px', fontWeight: 'bold' }}>{currencySymbol}95</span>
                  </div>
                </div>

                <div
                  className="preview-menu-card"
                  style={{
                    backgroundColor: `rgba(${parseInt(cardStyles.backgroundColor.slice(1, 3), 16)}, ${parseInt(cardStyles.backgroundColor.slice(3, 5), 16)}, ${parseInt(cardStyles.backgroundColor.slice(5, 7), 16)}, ${cardStyles.backgroundOpacity / 100})`,
                    border: `${cardStyles.borderWidth}px ${cardStyles.borderStyle} ${cardStyles.borderColor}`,
                    borderRadius: `${cardStyles.cornerRadius}px`,
                    boxShadow: cardStyles.shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  <h4 style={{ color: safeColors.textColor, margin: '0 0 8px 0' }}>İçecekler</h4>
                  <div className="preview-menu-item">
                    <span style={{ color: safeColors.textColor, fontSize: '14px' }}>Taze Sıkılmış Portakal</span>
                    <span style={{ color: safeColors.accentColor, fontSize: '14px', fontWeight: 'bold' }}>{currencySymbol}25</span>
                  </div>
                  <div className="preview-menu-item">
                    <span style={{ color: safeColors.textColor, fontSize: '14px' }}>Türk Kahvesi</span>
                    <span style={{ color: safeColors.accentColor, fontSize: '14px', fontWeight: 'bold' }}>{currencySymbol}15</span>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="preview-menu-links">
                <div className="preview-link">
                  <ClockIcon className="link-icon" style={{ color: safeColors.accentColor }} />
                  <span style={{ color: safeColors.textColor }}>Rezervasyon Oluştur</span>
                </div>

                <div className="preview-link">
                  <ChatBubbleLeftRightIcon className="link-icon" style={{ color: safeColors.accentColor }} />
                  <span style={{ color: safeColors.textColor }}>Geri Bildirim Ver</span>
                </div>

                <div className="preview-link">
                  <InformationCircleIcon className="link-icon" style={{ color: safeColors.accentColor }} />
                  <span style={{ color: safeColors.textColor }}>İşletme Bilgisi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignCustomizationPage;
