import React, { useState, useRef, useEffect } from 'react'; // Import hooks
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

const ModernDarkTemplate = ({ menuData, restaurantData, templateData, baseApiUrl }) => {
  // Hooks
  const [activeCategory, setActiveCategory] = useState(() => menuData?.categories?.[0]?.id || null);
  const [animateItemsKey, setAnimateItemsKey] = useState(0); // Key to trigger item animations
  const [navTopOffset, setNavTopOffset] = useState(150);
  const categoryRefs = useRef({});
  // Removed itemCardRefs as we'll simplify the animation trigger
  const headerRef = useRef(null);
  const navRef = useRef(null);

  // Calculate Nav Offset
  useEffect(() => {
    if (headerRef.current) {
      setNavTopOffset(headerRef.current.offsetHeight);
    }
  }, [menuData]); // Re-run if menuData changes (header content might change)

  // Initialize activeCategory & trigger animation on load/category change
  useEffect(() => {
    if (menuData?.categories?.length > 0) {
      if (activeCategory === null) {
        setActiveCategory(menuData.categories[0].id);
      }
      // Trigger animation for items in the current/new category
      // We'll use a timeout to ensure the DOM has items before trying to animate them
      setTimeout(() => {
        setAnimateItemsKey(prevKey => prevKey + 1); 
      }, 0);
    }
  }, [menuData, activeCategory]);

  // This useEffect is primarily to trigger re-render for animations when activeCategory changes.
  // The actual animation is handled by CSS transitions on each item card.
  useEffect(() => {
    // setTimeout ensures this runs after the initial state update for activeCategory
    setTimeout(() => {
        setAnimateItemsKey(prevKey => prevKey + 1);
    }, 0);
  }, [activeCategory]); // Depend only on activeCategory to re-trigger animations for that category's items


  // Basic validation
  if (!menuData || !menuData.categories || !restaurantData || !templateData || !baseApiUrl) {
    return <div className="p-4 text-red-500">Error: Missing required data for template rendering.</div>;
  }

  // Parse customization settings
  const settings = parseSettings(templateData.customization_settings);
  const styleConfig = settings.style_config || {};
  const layoutConfig = settings.base_layout_config || {};

  // Define styles based on config (with fallbacks)
  const styles = {
    backgroundColor: templateData.background_color || '#1F2937',
    textColor: templateData.text_color || '#D1D5DB',
    primaryColor: styleConfig.primaryColor || '#3B82F6',
    secondaryColor: styleConfig.secondaryColor || '#10B981',
    priceColor: styleConfig.priceColor || '#FBBF24',
    categoryHeaderTextColor: styleConfig.categoryHeaderTextColor || '#E5E7EB',
    itemCardBackground: styleConfig.itemCardBackground || '#374151',
    itemCardTextColor: styleConfig.itemCardTextColor || '#D1D5DB',
    borderColor: styleConfig.borderColor || '#4B5563',
    fontFamily: templateData.font_family || 'Inter, system-ui, sans-serif', // Use direct column first
    fontSizeBase: styleConfig.fontSizeBase || '1rem',
    borderRadius: styleConfig.borderRadius || '0.5rem',
    shadows: styleConfig.shadows || 'shadow-xl',
    categorySpacing: layoutConfig.categorySpacing || 'py-6 md:py-8', // Adjusted for mobile
    itemSpacing: layoutConfig.itemSpacing || 'p-3 md:p-4', // Adjusted for mobile
    // gridColumns will be handled by responsive classes directly in JSX
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
      borderColor: styles.primaryColor, // Using primary for border accent
    },
    itemCard: {
      backgroundColor: styles.itemCardBackground,
      color: styles.itemCardTextColor,
      borderRadius: styles.borderRadius,
      borderColor: styles.borderColor,
    },
    price: {
      color: styles.priceColor,
    },
    itemName: {
       color: styles.primaryColor, // Example: Use primary color for item names
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
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight - navHeight - 20; 
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    // Trigger animation for the newly selected category's items
    setAnimateItemsKey(prevKey => prevKey + 1); 
  };

  return (
    <div className="min-h-screen" style={dynamicStyles.container}>
      {/* Sticky Header */}
      <header ref={headerRef} className="sticky top-0 z-40 shadow-md" style={{backgroundColor: styles.backgroundColor}}>
        <div className="container mx-auto px-3 sm:px-4 py-4">
          <div className="text-center">
            {restaurantData.logo_path && (
              <img 
                src={`${baseApiUrl}${restaurantData.logo_path.startsWith('/') ? restaurantData.logo_path : `/${restaurantData.logo_path}`}`}
                alt={`${restaurantData.name} Logo`} 
                className="mx-auto h-16 md:h-20 w-auto object-contain mb-2 md:mb-3" 
              />
            )}
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: styles.primaryColor }}>
              {restaurantData.name}
            </h1>
            {restaurantData.description && (
              <p className="mt-1 md:mt-2 text-md md:text-lg" style={{ color: styles.textColor }}>
                {restaurantData.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Sticky Category Navigation */}
      {menuData.categories && menuData.categories.length > 0 && (
        <nav 
          ref={navRef} 
          className="sticky z-30 shadow-sm overflow-x-auto whitespace-nowrap scrollbar-hide border-b" 
          style={{ top: `${navTopOffset}px`, borderColor: styles.borderColor, backgroundColor: styles.backgroundColor }}
        >
          <ul className="flex px-4 py-3 items-center gap-4 justify-center">
            {menuData.categories.map(cat => (
              <li key={cat.id} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 text-center group" onClick={() => handleCategoryClick(cat.id)}>
                <div className={`w-16 h-16 rounded-full border-2 p-0.5 transition-all ${activeCategory === cat.id ? 'border-opacity-100 scale-110' : 'border-transparent group-hover:border-opacity-50 group-hover:scale-105'}`} style={{borderColor: styles.primaryColor}}>
                  <img 
                    src={cat.image_path ? `${baseApiUrl}${cat.image_path.startsWith('/') ? cat.image_path : `/${cat.image_path}`}` : '/placeholder-category.png'} 
                    alt={cat.name} 
                    className="w-full h-full object-cover rounded-full bg-gray-600" // Darker bg for placeholder on dark theme
                    onError={(e) => { e.target.src = '/placeholder-category.png'; }}
                  />
                </div>
                <span className={`text-xs font-medium transition-colors ${activeCategory === cat.id ? 'font-bold' : 'text-gray-300 group-hover:text-white'}`} style={{color: activeCategory === cat.id ? styles.primaryColor : styles.textColor}}>
                  {cat.name}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      )}
      
      {/* Main Content Area */}
      <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
        {/* Menu Categories */}
        {menuData.categories.map((category) => (
          <div ref={el => categoryRefs.current[category.id] = el} key={category.id} className={`mb-8 md:mb-12 ${styles.categorySpacing} pt-4`} id={`category-${category.id}`}>
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 border-b-2 pb-2" 
              style={dynamicStyles.categoryHeader}
            >
              {category.name}
            </h2>
            {category.description && (
              <p className="mb-4 md:mb-6 text-sm md:text-base" style={{ color: styles.textColor }}>
                {category.description}
              </p>
            )}

            {/* Menu Items Grid - Responsive Columns */}
            <div className={`grid grid-cols-1 ${layoutConfig.gridColumns || 'sm:grid-cols-2 md:grid-cols-3'} gap-4 md:gap-6`}>
              {category.items && category.items.length > 0 ? (
                category.items.map((item, index) => (
                  <div 
                    key={item.id}
                    // Add a unique key for react to properly handle re-renders for animation: animateItemsKey + item.id
                    // The animation classes are applied, and transitions handle the effect.
                    className={`border ${styles.shadows} overflow-hidden ${styles.itemSpacing} flex flex-col 
                                opacity-0 transform -translate-y-3 transition-all duration-500 ease-out 
                                group-hover:opacity-100 group-hover:translate-y-0`} // Example of a group hover effect
                    style={{ 
                      ...dynamicStyles.itemCard, 
                      transitionDelay: `${index * 100}ms`,
                      // Apply 'visible' style when animateItemsKey changes for the current category
                      // This relies on the component re-rendering.
                      opacity: category.id === activeCategory ? 1 : 0, 
                      transform: category.id === activeCategory ? 'translateY(0)' : 'translateY(-0.5rem)',
                    }}
                  >
                    {item.image_path && (
                      <img 
                        src={`${baseApiUrl}${item.image_path.startsWith('/') ? item.image_path : `/${item.image_path}`}`}
                        alt={item.name} 
                        className={`w-full h-40 md:h-48 object-cover mb-3 md:mb-4 ${styles.borderRadius ? `rounded-t-[${styles.borderRadius}]` : 'rounded-t-lg'}`}
                      />
                    )}
                    <div className="flex-grow flex flex-col"> {/* Allow description to push price down */}
                      <div className="flex justify-between items-start mb-1 md:mb-2">
                        <h3 className="text-lg md:text-xl font-semibold" style={dynamicStyles.itemName}>
                          {item.name}
                        </h3>
                        <span className="text-md md:text-lg font-bold whitespace-nowrap pl-3 md:pl-4" style={dynamicStyles.price}>
                          {restaurantData.currency_code === 'TRY' ? `₺${item.price}` : `$${item.price}`}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs md:text-sm flex-grow" style={{ color: styles.itemCardTextColor }}> {/* Added flex-grow */}
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: styles.textColor }} className="col-span-full text-center py-4">No items in this category yet.</p>
              )}
            </div>
          </div>
        ))}
        
        {/* Footer */}
        <footer className="text-center mt-8 md:mt-12 pt-4 md:pt-6 border-t" style={{ borderColor: styles.borderColor }}>
          <p className="text-sm md:text-base" style={{ color: styles.textColor }}>
            {restaurantData.custom_footer_text || `© ${new Date().getFullYear()} ${restaurantData.name}`}
          </p>
          {!restaurantData.allow_remove_branding && (
            <p className="text-xs opacity-75 mt-2" style={{ color: styles.textColor }}>
              Powered by QR Menu Platform
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

// PropTypes for basic type checking
ModernDarkTemplate.propTypes = {
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

export default ModernDarkTemplate;
