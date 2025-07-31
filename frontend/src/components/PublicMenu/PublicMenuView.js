import { useState, useEffect, useRef } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isLoaded, setIsLoaded] = useState(false);
  const sectionRefs = useRef([]);

  // Animation variants

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const tabsVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemsVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Load menu data when component mounts or restaurantSlug changes
  useEffect(() => {
    if (!restaurantSlug) {
      setMenuUnavailable(true);
      return;
    }

    if (isPreview) {
      loadPreviewMenuData(restaurantSlug)
        .then(() => {
          setIsLoaded(true);
        })
        .catch(() => {
          setMenuUnavailable(true);
        });
    } else {
      loadPublicMenuData(restaurantSlug)
        .then(() => {
          setIsLoaded(true);
        })
        .catch((error) => {
          if (error.message === 'MENU_INACTIVE' || error.message === 'RESTAURANT_NOT_FOUND') {
            setMenuUnavailable(true);
          }
        });
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
  if (!isPreview && !currentRestaurant?.isActive) {
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
    backgroundColor: currentBranding?.colors?.backgroundColor || '#f9fafb',
    color: currentBranding?.colors?.textColor || '#1f2937',
    '--accent-color': currentBranding?.colors?.accentColor || currentBranding?.primaryColor || '#8b5cf6',
    '--text-color': currentBranding?.colors?.textColor || '#1f2937',
    '--bg-color': currentBranding?.colors?.backgroundColor || '#f9fafb',
    position: 'relative'
  };

  // Background image and theme styles
  const backgroundStyle = {};
  if (currentBranding?.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${currentBranding.backgroundImage})`;
    backgroundStyle.backgroundRepeat = currentBranding.backgroundSettings?.repeat || 'no-repeat';
    backgroundStyle.backgroundSize = currentBranding.backgroundSettings?.size || 'cover';
    backgroundStyle.backgroundPosition = currentBranding.backgroundSettings?.position || 'center center';
    backgroundStyle.backgroundAttachment = 'fixed';
    if (currentBranding.backgroundSettings?.opacity !== undefined) {
      backgroundStyle.opacity = currentBranding.backgroundSettings.opacity / 100;
    }
  } else if (currentBranding?.selectedTheme) {
    Object.assign(backgroundStyle, currentBranding.selectedTheme.style);
  }

  // Card styles for menu items and sections
  const cardStyle = currentBranding?.cardStyles ? {
    backgroundColor: `rgba(${parseInt(currentBranding.cardStyles.backgroundColor?.slice(1, 3) || 'ff', 16)}, ${parseInt(currentBranding.cardStyles.backgroundColor?.slice(3, 5) || 'ff', 16)}, ${parseInt(currentBranding.cardStyles.backgroundColor?.slice(5, 7) || 'ff', 16)}, ${(currentBranding.cardStyles.backgroundOpacity || 95) / 100})`,
    border: `${currentBranding.cardStyles.borderWidth || 1}px ${currentBranding.cardStyles.borderStyle || 'solid'} ${currentBranding.cardStyles.borderColor || '#e5e7eb'}`,
    borderRadius: `${currentBranding.cardStyles.cornerRadius || 8}px`,
    boxShadow: currentBranding.cardStyles.shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
  } : {};

  return (
    <div className="public-menu-view" style={{...pageStyle, ...backgroundStyle}}>
      {/* Background Overlay */}
      {(currentBranding?.backgroundImage || currentBranding?.selectedTheme) && (currentBranding?.overlayOpacity || 0) > 0 && (
        <div
          className="background-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: currentBranding?.overlayColor || '#000000',
            opacity: (currentBranding?.overlayOpacity || 0) / 100,
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
            📱 Önizleme Modu - Bu menü şu anda {currentRestaurant?.isActive ? 'aktif' : 'taslak'} durumda
          </div>
        )}

      {/* Header */}
      <motion.header
        className="menu-header"
        style={{ backgroundColor: currentBranding?.colors?.backgroundColor || '#ffffff' }}
        variants={headerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <div className="header-content">
          {/* Logo */}
          <motion.div
            className="restaurant-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {currentBranding?.logo ? (
              <img
                src={currentBranding.logo}
                alt={currentRestaurant?.name || 'Restaurant'}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="logo-placeholder"
              style={{ display: currentBranding?.logo ? 'none' : 'flex' }}
            >
              <PhotoIcon className="logo-icon" />
            </div>
          </motion.div>

          {/* Restaurant Info */}
          <motion.div
            className="restaurant-info"
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="restaurant-name">{currentRestaurant?.name || 'Restaurant'}</h1>
            <div className="restaurant-details">
              <div className="detail-item">
                <MapPinIcon className="detail-icon" />
                <span>{currentRestaurant?.address || 'Address not available'}</span>
              </div>
              <div className="detail-item">
                <ClockIcon className="detail-icon" />
                <span>{currentRestaurant?.hours || 'Hours not available'}</span>
              </div>
              <div className="detail-item">
                <PhoneIcon className="detail-icon" />
                <span>{currentRestaurant?.phone || 'Phone not available'}</span>
              </div>
            </div>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            className="language-selector"
            initial={{ opacity: 0, x: 20 }}
            animate={isLoaded ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
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
          </motion.div>
        </div>
      </motion.header>

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
        <motion.nav
          className="category-navigation"
          variants={tabsVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          <motion.div className="category-tabs">
            {currentMenu.sections.map((section, index) => (
              <motion.div
                key={section.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <SectionTab
                  section={section}
                  isActive={activeSection === index}
                  onClick={() => scrollToSection(index)}
                  accentColor={currentBranding?.colors?.accentColor || currentBranding?.primaryColor || '#8b5cf6'}
                  selectedLanguage={selectedLanguage}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.nav>
      )}

      {/* Menu Content */}
      <main className="menu-content">
        <AnimatePresence mode="wait">
          {searchQuery ? (
            // Search Results
            <motion.div
              key="search-results"
              className="search-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="search-title">
                Arama Sonuçları ({filteredItems.length})
              </h2>
              {filteredItems.length > 0 ? (
                <motion.div
                  className="search-items"
                  variants={itemsVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <MenuItemCard
                        item={item}
                        showSection={true}
                        sectionTitle={item.sectionTitle}
                        textColor={currentBranding?.colors?.textColor || '#1f2937'}
                        accentColor={currentBranding?.colors?.accentColor || currentBranding?.primaryColor || '#8b5cf6'}
                        cardStyle={cardStyle}
                        currencySymbol={currencySymbol}
                        selectedLanguage={selectedLanguage}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  className="no-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p>Aradığınız kriterlere uygun ürün bulunamadı.</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Menu Sections
            <motion.div
              key="menu-sections"
              className="menu-sections"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentMenu.sections.map((section, index) => (
                <motion.section
                  key={section.id}
                  ref={el => sectionRefs.current[index] = el}
                  className="menu-section"
                  id={`section-${index}`}
                  style={cardStyle}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Section Header */}
                  <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
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
                  </motion.div>

                  {/* Section Items */}
                  <motion.div
                    className="section-items"
                    variants={itemsVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        variants={{
                          hidden: { opacity: 0, y: 30 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.5, delay: itemIndex * 0.1 }}
                      >
                        <MenuItemCard
                          item={item}
                          textColor={currentBranding?.colors?.textColor || '#1f2937'}
                          accentColor={currentBranding?.colors?.accentColor || currentBranding?.primaryColor || '#8b5cf6'}
                          cardStyle={cardStyle}
                          currencySymbol={currencySymbol}
                          selectedLanguage={selectedLanguage}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.section>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
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
