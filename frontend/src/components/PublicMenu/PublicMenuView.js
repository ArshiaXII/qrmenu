import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  PhotoIcon,
  ChevronDownIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MenuItemCard from './MenuItemCard';
import SectionTab from './SectionTab';
import { useMenu } from '../../contexts/MenuContext';
import './PublicMenuView.css';

// Utility function for multi-language support
const getDisplayText = (multiLangValue, preferredLang = 'tr') => {
  if (typeof multiLangValue === 'string') {
    return multiLangValue;
  }
  if (!multiLangValue || typeof multiLangValue !== 'object') {
    return '';
  }
  return multiLangValue[preferredLang] ||
         multiLangValue['tr'] ||
         Object.values(multiLangValue)[0] || '';
};

const PublicMenuView = () => {
  const { restaurantSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  const {
    currentMenu,
    currentRestaurant,
    currentBranding,
    isLoading,
    error,
    loadPublicMenuData,
    loadPreviewMenuData
  } = useMenu();

  const [activeSection, setActiveSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('tr'); // Use language codes
  const [menuUnavailable, setMenuUnavailable] = useState(false);
  const sectionRefs = useRef([]);



  // Load menu data when component mounts or restaurantSlug changes
  useEffect(() => {
    console.log('🔍 [PublicMenuView] useEffect triggered');
    console.log('🔍 [PublicMenuView] restaurantSlug from URL:', restaurantSlug);
    console.log('🔍 [PublicMenuView] isPreview mode:', isPreview);
    console.log('🔍 [PublicMenuView] Current URL:', window.location.href);

    if (restaurantSlug) {
      if (isPreview) {
        console.log('🔍 [PublicMenuView] Loading preview data for slug:', restaurantSlug);
        // For preview mode, use loadPreviewMenuData to bypass active status check
        loadPreviewMenuData(restaurantSlug).catch((error) => {
          console.error('❌ [PublicMenuView] Failed to load preview menu data:', error);
          if (error.message === 'RESTAURANT_NOT_FOUND') {
            setMenuUnavailable(true);
          }
        });
      } else {
        console.log('🔍 [PublicMenuView] Loading public data for slug:', restaurantSlug);
        // Normal public access
        loadPublicMenuData(restaurantSlug).catch((error) => {
          console.error('❌ [PublicMenuView] Failed to load menu data:', error);
          console.error('❌ [PublicMenuView] Error message:', error.message);
          if (error.message === 'MENU_INACTIVE' || error.message === 'RESTAURANT_NOT_FOUND') {
            console.log('🔍 [PublicMenuView] Setting menu unavailable due to:', error.message);
            setMenuUnavailable(true);
          }
        });
      }
    } else {
      console.log('❌ [PublicMenuView] No restaurant slug found in URL');
    }
  }, [restaurantSlug, isPreview, loadPublicMenuData, loadPreviewMenuData]);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim() || !currentMenu) {
      setFilteredItems([]);
      return;
    }

    const filtered = [];
    currentMenu.sections.forEach(section => {
      section.items.forEach(item => {
        const itemTitle = getDisplayText(item.title, selectedLanguage);
        const itemDescription = getDisplayText(item.description, selectedLanguage);
        const sectionTitle = getDisplayText(section.title, selectedLanguage);

        if (
          itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          itemDescription.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          filtered.push({
            ...item,
            sectionId: section.id,
            sectionTitle: sectionTitle,
            displayTitle: itemTitle,
            displayDescription: itemDescription
          });
        }
      });
    });
    setFilteredItems(filtered);
  }, [searchQuery, currentMenu, selectedLanguage]);

  // Scroll to section when tab is clicked
  const scrollToSection = (sectionIndex) => {
    setActiveSection(sectionIndex);
    if (sectionRefs.current[sectionIndex]) {
      sectionRefs.current[sectionIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setFilteredItems([]);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="public-menu-loading">
        <div className="loading-spinner"></div>
        <p>Menü yükleniyor...</p>
      </div>
    );
  }

  // Show error state for unavailable menu
  if (menuUnavailable || error) {
    return (
      <div className="public-menu-unavailable">
        <div className="unavailable-content">
          <ExclamationTriangleIcon className="unavailable-icon" />
          <h2>Menü Şu Anda Mevcut Değil</h2>
          <p>
            {error === 'RESTAURANT_NOT_FOUND'
              ? 'Bu restoran bulunamadı.'
              : 'Bu menü şu anda aktif değil veya geçici olarak kullanılamıyor.'
            }
          </p>
          <p>Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  // Don't render if data is not loaded yet
  if (!currentMenu || !currentRestaurant || !currentBranding) {
    return null;
  }

  // Check if menu is active (skip check for preview mode)
  console.log('🔍 [PublicMenuView] Status check - isPreview:', isPreview);
  console.log('🔍 [PublicMenuView] Status check - currentRestaurant.isActive:', currentRestaurant?.isActive);
  console.log('🔍 [PublicMenuView] Status check - currentRestaurant:', currentRestaurant);

  if (!isPreview && !currentRestaurant.isActive) {
    console.log('❌ [PublicMenuView] Menu is inactive, showing unavailable message');
    return (
      <div className="public-menu-unavailable">
        <div className="unavailable-content">
          <ExclamationTriangleIcon className="unavailable-icon" />
          <h2>Menü Şu Anda Aktif Değil</h2>
          <p>Bu menü geçici olarak devre dışı bırakılmıştır.</p>
          <p>Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  console.log('✅ [PublicMenuView] Menu is active, rendering content');

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

  // Dynamic styles based on branding
  const pageStyle = {
    backgroundColor: currentBranding.colors.backgroundColor,
    color: currentBranding.colors.textColor,
    '--accent-color': currentBranding.colors.accentColor,
    '--text-color': currentBranding.colors.textColor,
    '--bg-color': currentBranding.colors.backgroundColor,
    position: 'relative'
  };

  // Background image and theme styles
  const backgroundStyle = {};
  if (currentBranding.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${currentBranding.backgroundImage})`;
    backgroundStyle.backgroundRepeat = currentBranding.backgroundSettings?.repeat || 'no-repeat';
    backgroundStyle.backgroundSize = currentBranding.backgroundSettings?.size || 'cover';
    backgroundStyle.backgroundPosition = currentBranding.backgroundSettings?.position || 'center center';
    backgroundStyle.backgroundAttachment = 'fixed';
    if (currentBranding.backgroundSettings?.opacity !== undefined) {
      backgroundStyle.opacity = currentBranding.backgroundSettings.opacity / 100;
    }
  } else if (currentBranding.selectedTheme) {
    Object.assign(backgroundStyle, currentBranding.selectedTheme.style);
  }

  // Card styles for menu items and sections
  const cardStyle = currentBranding.cardStyles ? {
    backgroundColor: `rgba(${parseInt(currentBranding.cardStyles.backgroundColor?.slice(1, 3) || 'ff', 16)}, ${parseInt(currentBranding.cardStyles.backgroundColor?.slice(3, 5) || 'ff', 16)}, ${parseInt(currentBranding.cardStyles.backgroundColor?.slice(5, 7) || 'ff', 16)}, ${(currentBranding.cardStyles.backgroundOpacity || 95) / 100})`,
    border: `${currentBranding.cardStyles.borderWidth || 1}px ${currentBranding.cardStyles.borderStyle || 'solid'} ${currentBranding.cardStyles.borderColor || '#e5e7eb'}`,
    borderRadius: `${currentBranding.cardStyles.cornerRadius || 8}px`,
    boxShadow: currentBranding.cardStyles.shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
  } : {};

  return (
    <div className="public-menu-view" style={{...pageStyle, ...backgroundStyle}}>
      {/* Background Overlay */}
      {(currentBranding.backgroundImage || currentBranding.selectedTheme) && currentBranding.overlayOpacity > 0 && (
        <div
          className="background-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: currentBranding.overlayColor || '#000000',
            opacity: (currentBranding.overlayOpacity || 0) / 100,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Content Container */}
      <div className="menu-content-container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Preview Banner */}
        {isPreview && (
          <div style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '8px 16px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📱 Önizleme Modu - Bu menü şu anda {currentRestaurant.isActive ? 'aktif' : 'taslak'} durumda
          </div>
        )}

      {/* Header */}
      <header className="menu-header" style={{ backgroundColor: currentBranding.colors.backgroundColor }}>
        <div className="header-content">


          {/* Logo */}
          <div className="restaurant-logo">
            {currentBranding.logo ? (
              <img
                src={currentBranding.logo}
                alt={currentRestaurant.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="logo-placeholder"
              style={{ display: currentBranding.logo ? 'none' : 'flex' }}
            >
              <PhotoIcon className="logo-icon" />
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="restaurant-info">
            <h1 className="restaurant-name">{currentRestaurant.name}</h1>
            <div className="restaurant-details">
              <div className="detail-item">
                <MapPinIcon className="detail-icon" />
                <span>{currentRestaurant.address}</span>
              </div>
              <div className="detail-item">
                <ClockIcon className="detail-icon" />
                <span>{currentRestaurant.hours}</span>
              </div>
              <div className="detail-item">
                <PhoneIcon className="detail-icon" />
                <span>{currentRestaurant.phone}</span>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="language-selector">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="tr">🇹🇷 Türkçe</option>
              <option value="en">🇺🇸 English</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="fr">🇫🇷 Français</option>
            </select>
            <ChevronDownIcon className="dropdown-icon" />
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Menüde ara..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="clear-search">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      {!searchQuery && (
        <nav className="category-navigation">
          <div className="category-tabs">
            {currentMenu.sections.map((section, index) => (
              <SectionTab
                key={section.id}
                section={section}
                isActive={activeSection === index}
                onClick={() => scrollToSection(index)}
                accentColor={currentBranding.colors.accentColor}
                selectedLanguage={selectedLanguage}
              />
            ))}
          </div>
        </nav>
      )}

      {/* Menu Content */}
      <main className="menu-content">
        {searchQuery ? (
          // Search Results
          <div className="search-results">
            <h2 className="search-title">
              Arama Sonuçları ({filteredItems.length})
            </h2>
            {filteredItems.length > 0 ? (
              <div className="search-items">
                {filteredItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    showSection={true}
                    sectionTitle={item.sectionTitle}
                    textColor={currentBranding.colors.textColor}
                    accentColor={currentBranding.colors.accentColor}
                    cardStyle={cardStyle}
                    currencySymbol={currencySymbol}
                    selectedLanguage={selectedLanguage}
                  />
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
              </div>
            )}
          </div>
        ) : (
          // Menu Sections
          <div className="menu-sections">
            {currentMenu.sections.map((section, index) => (
              <section
                key={section.id}
                ref={el => sectionRefs.current[index] = el}
                className="menu-section"
                id={`section-${index}`}
                style={cardStyle}
              >
                {/* Section Header */}
                <div className="section-header">
                  {section.image && (
                    <div className="section-image">
                      <img
                        src={section.image}
                        alt={getDisplayText(section.title, selectedLanguage)}
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="section-info">
                    <h2 className="section-title">{getDisplayText(section.title, selectedLanguage)}</h2>
                    {section.description && (
                      <p className="section-description">{getDisplayText(section.description, selectedLanguage)}</p>
                    )}
                  </div>
                </div>

                {/* Section Items */}
                <div className="section-items">
                  {section.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      textColor={currentBranding.colors.textColor}
                      accentColor={currentBranding.colors.accentColor}
                      cardStyle={cardStyle}
                      currencySymbol={currencySymbol}
                      selectedLanguage={selectedLanguage}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

        {/* Footer */}
        <footer className="menu-footer">
          <p>Powered by FineDine</p>
        </footer>
      </div>
    </div>
  );
};

export default PublicMenuView;
