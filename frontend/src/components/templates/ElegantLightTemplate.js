import React, { useState, useRef, useEffect } from 'react'; // Import useState, useRef, AND useEffect
import PropTypes from 'prop-types';

// Helper to parse settings safely
const parseSettings = (settingsString) => {
  try {
    return JSON.parse(settingsString || '{}');
  } catch (e) {
    console.error("Error parsing template settings:", e);
    return {}; // Return empty object on error
  }
};

const ElegantLightTemplate = ({ menuData, restaurantData, templateData, baseApiUrl }) => {
  // --- Hooks must be called at the top level ---
  // State for active category and refs for scrolling
  // Initialize useState with a function to avoid accessing menuData if it's initially null/invalid
  const [activeCategory, setActiveCategory] = useState(() => menuData?.categories?.[0]?.id || null);
  const [navTopOffset, setNavTopOffset] = useState(150); // Default offset, will update
  const categoryRefs = useRef({});
  const headerRef = useRef(null); 
  const navRef = useRef(null); 

  // --- Calculate Nav Offset after Header Mount ---
  useEffect(() => {
    if (headerRef.current) {
      setNavTopOffset(headerRef.current.offsetHeight);
    }
  // IMPORTANT: headerRef.current is not a stable dependency for useEffect.
  // This effect should run when the component mounts and potentially if menuData (which might affect header) changes.
  // However, for simplicity and given header height is unlikely to change drastically after initial render,
  // we'll leave it, but be mindful this could be improved if header height was very dynamic.
  // A better dependency might be just an empty array [] if header height is fixed after first render.
  }, [menuData]); // Re-run if menuData changes, as header content might change

  // --- Initialize activeCategory again if menuData becomes available after initial render ---
  useEffect(() => {
    if (menuData?.categories?.length > 0 && activeCategory === null) {
      setActiveCategory(menuData.categories[0].id);
    }
  }, [menuData, activeCategory]); // Dependencies are correct here

  // --- Basic validation (can now happen after hooks) ---
  if (!menuData || !menuData.categories || !restaurantData || !templateData || !baseApiUrl) {
    return <div className="p-4 text-red-500">Error: Missing required data for template rendering.</div>;
  }
  
  // Parse customization settings
  const settings = parseSettings(templateData.customization_settings);
  const styleConfig = settings.style_config || {};
  const layoutConfig = settings.base_layout_config || {};

  // Define styles based on config (with fallbacks)
  const styles = {
    backgroundColor: templateData.background_color || '#F9FAFB',
    textColor: templateData.text_color || '#1F2937',
    primaryColor: styleConfig.primaryColor || '#D97706',
    secondaryColor: styleConfig.secondaryColor || '#059669', // Green
    priceColor: styleConfig.priceColor || '#1F2937',
    categoryHeaderTextColor: styleConfig.categoryHeaderTextColor || '#111827',
    itemCardBackground: styleConfig.itemCardBackground || '#FFFFFF',
    itemCardTextColor: styleConfig.itemCardTextColor || '#374151',
    borderColor: styleConfig.borderColor || '#E5E7EB', // gray-200
    fontFamily: templateData.font_family || 'Playfair Display, serif', // Use direct column first
    fontSizeBase: styleConfig.fontSizeBase || '1.05rem',
    borderRadius: styleConfig.borderRadius || '0.375rem', // 6px
    shadows: styleConfig.shadows || 'shadow-sm',
    categorySpacing: layoutConfig.categorySpacing || 'py-8 md:py-10', // Adjusted for mobile
    itemSpacing: layoutConfig.itemSpacing || 'py-4 md:py-6', // Adjusted for mobile
  };

  // Inline styles for dynamic colors
  const dynamicStyles = {
    container: {
      backgroundColor: styles.backgroundColor,
      color: styles.textColor,
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSizeBase,
    },
    categoryHeader: {
      color: styles.categoryHeaderTextColor,
      fontFamily: styles.fontFamily, // Ensure header uses the elegant font
      borderColor: styles.primaryColor, // Use primary for subtle accent
    },
    itemCard: {
      backgroundColor: styles.itemCardBackground,
      color: styles.itemCardTextColor,
      borderRadius: styles.borderRadius,
      borderColor: styles.borderColor,
    },
    price: {
      color: styles.priceColor,
      fontFamily: 'Inter, sans-serif', // Use a more standard font for price clarity
      fontWeight: '600',
    },
    itemName: {
       color: styles.primaryColor, // Use primary color for item names
       fontFamily: styles.fontFamily, // Ensure item name uses the elegant font
       fontWeight: '700', // Bolder for Playfair Display
    },
    itemDescription: {
        fontFamily: 'Inter, sans-serif', // Use a readable sans-serif for descriptions
        color: styles.itemCardTextColor,
        fontSize: '0.95rem', // Slightly smaller
    }
  };

  // Scroll handler
  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    const element = categoryRefs.current[categoryId];
    const headerElement = headerRef.current;
    const navElement = navRef.current;

    if (element && headerElement && navElement) {
      const headerHeight = headerElement.offsetHeight;
      const navHeight = navElement.offsetHeight;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - navHeight - 20; // Added extra offset

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen" style={dynamicStyles.container}>
      {/* Sticky Header */}
      <header ref={headerRef} className="sticky top-0 z-40 bg-white shadow-md" style={{backgroundColor: styles.backgroundColor}}>
        <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-16 py-4">
          <div className="text-center">
            {restaurantData.logo_path && (
              <img 
                src={`${baseApiUrl}${restaurantData.logo_path.startsWith('/') ? restaurantData.logo_path : `/${restaurantData.logo_path}`}`}
                alt={`${restaurantData.name} Logo`} 
                className="mx-auto h-16 md:h-20 w-auto object-contain mb-2 md:mb-3" 
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: styles.primaryColor, fontFamily: styles.fontFamily }}>
              {restaurantData.name}
            </h1>
            {restaurantData.description && (
              <p className="mt-1 md:mt-2 text-md md:text-lg" style={{ color: styles.textColor, fontFamily: 'Inter, sans-serif' }}>
                {restaurantData.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Category Navigation */}
      {menuData.categories && menuData.categories.length > 0 && (
        // Use dynamic top offset from state
        <nav 
          ref={navRef} 
          className="sticky z-30 bg-white shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide border-b" 
          style={{ top: `${navTopOffset}px`, borderColor: styles.borderColor, backgroundColor: styles.backgroundColor }}
        >
          <ul className="flex px-4 py-3 items-center gap-4 justify-center"> {/* Centered items */}
            {menuData.categories.map(cat => (
              <li key={cat.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 text-center group" onClick={() => handleCategoryClick(cat.id)}>
                <div className={`w-16 h-16 rounded-full border-2 p-0.5 transition-all ${activeCategory === cat.id ? 'border-opacity-100 scale-110' : 'border-transparent group-hover:border-opacity-50 group-hover:scale-105'}`} style={{borderColor: styles.primaryColor}}>
                  {/* Assuming category images exist, otherwise use placeholder */}
                  <img 
                    src={cat.image_path ? `${baseApiUrl}${cat.image_path.startsWith('/') ? cat.image_path : `/${cat.image_path}`}` : '/placeholder-category.png'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover rounded-full bg-gray-200" // Added bg for placeholders
                    onError={(e) => { e.target.src = '/placeholder-category.png'; }}
                  />
                </div>
                <span className={`text-xs font-medium transition-colors ${activeCategory === cat.id ? 'font-bold' : 'text-gray-600 group-hover:text-gray-900'}`} style={{color: activeCategory === cat.id ? styles.primaryColor : styles.textColor}}>
                  {cat.name}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-3 sm:px-4 md:px-8 lg:px-16 py-8 md:py-12"> 
        {/* Removed the static header section as it's now sticky */}
        
        {/* Menu Categories */}
        {menuData.categories.map((category) => (
          // Add ref and id to the section container for scrolling
          <div ref={el => categoryRefs.current[category.id] = el} key={category.id} className={`mb-10 md:mb-16 ${styles.categorySpacing} pt-4`} id={`category-${category.id}`}> 
            {/* Category Header */}
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-10 pb-2 md:pb-3 border-b-2" 
              style={dynamicStyles.categoryHeader}
            >
              {category.name}
            </h2>
            {category.description && (
              <p className="text-center mb-6 md:mb-10 text-md md:text-lg" style={{ color: styles.textColor, fontFamily: 'Inter, sans-serif' }}>
                {category.description}
              </p>
            )}

            {/* Menu Items List */}
            <div className="space-y-6 md:space-y-8">
              {category.items && category.items.length > 0 ? (
                category.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`flex flex-col sm:flex-row items-center border-b ${styles.shadows} ${styles.itemSpacing}`} 
                    style={{...dynamicStyles.itemCard, paddingBottom: '1.25rem', paddingTop: '1.25rem'}} // Adjusted padding
                  >
                    {item.image_path && (
                      <img 
                        src={`${baseApiUrl}${item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}`}
                        alt={item.name} 
                        className="w-full sm:w-24 md:w-32 h-32 sm:h-24 md:h-32 object-cover mb-3 sm:mb-0 sm:mr-4 md:mr-6 flex-shrink-0" // Adjusted sizes
                        style={{ borderRadius: styles.borderRadius }}
                      />
                    )}
                    <div className="flex-grow text-center sm:text-left w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row justify-between items-center mb-1 md:mb-2">
                        <h3 className="text-xl md:text-2xl mb-1 sm:mb-0" style={dynamicStyles.itemName}>
                          {item.name}
                        </h3>
                        <span className="text-lg md:text-xl whitespace-nowrap sm:pl-4" style={dynamicStyles.price}>
                          {restaurantData.currency_code === 'TRY' ? `₺${item.price}` : `$${item.price}`}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm md:text-base" style={dynamicStyles.itemDescription}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4" style={{ color: styles.textColor }}>No items in this category yet.</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Footer */}
        <footer className="text-center mt-10 md:mt-16 pt-6 md:pt-8 border-t" style={{ borderColor: styles.borderColor }}>
          <p className="text-xs md:text-sm" style={{ color: styles.textColor, fontFamily: 'Inter, sans-serif' }}>
            {restaurantData.custom_footer_text || `© ${new Date().getFullYear()} ${restaurantData.name}`}
          </p>
          {!restaurantData.allow_remove_branding && (
            <p className="text-xs opacity-75 mt-2" style={{ color: styles.textColor, fontFamily: 'Inter, sans-serif' }}>
              Powered by QR Menu Platform
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

// PropTypes
ElegantLightTemplate.propTypes = {
  menuData: PropTypes.shape({
    categories: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      items: PropTypes.arrayOf(PropTypes.shape({ // Corrected from menu_items to items
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        image_path: PropTypes.string,
      })),
    })).isRequired,
  }).isRequired,
  restaurantData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    logo_path: PropTypes.string,
    currency_code: PropTypes.string,
    custom_footer_text: PropTypes.string,
  }).isRequired,
  templateData: PropTypes.shape({
    background_color: PropTypes.string,
    text_color: PropTypes.string,
    font_family: PropTypes.string,
    customization_settings: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // Can be string or parsed object
  }).isRequired,
  baseApiUrl: PropTypes.string.isRequired, // Add baseApiUrl to propTypes
};

export default ElegantLightTemplate;
