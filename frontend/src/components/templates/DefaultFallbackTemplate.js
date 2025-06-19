import React from 'react';
// import PropTypes from 'prop-types'; // Keep PropTypes commented out

const DefaultFallbackTemplate = ({ menuData, restaurantData, templateData, baseApiUrl }) => {
  // Basic validation
  if (!menuData || !restaurantData || !templateData) {
    return <div className="p-4 text-red-500">Error: Missing required data for fallback template.</div>;
  }

  // Destructure only necessary names for simple display
  const { name: restaurantName } = restaurantData;
  const { name: templateName } = templateData;
  const { name: menuName, categories, uncategorizedItems } = menuData; // Added categories and uncategorizedItems
  const { currency_code } = restaurantData; // For currency symbol

  // Currency Symbol Helper
  const getCurrencySymbol = (code) => {
    switch (code) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'TRY': return '₺';
        case 'RUB': return '₽';
        default: return '$';
    }
  };
  const currencySymbol = getCurrencySymbol(currency_code);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', minHeight: '100vh', color: '#333', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <h1>{templateName || 'Menu'}</h1>
        <h2>Restaurant: {restaurantName || 'N/A'}</h2>
        <p>Menu Name: {menuName || 'N/A'}</p>
        <p><em>(Displaying with a basic fallback template.)</em></p>
      </header>
      
      {categories && categories.map(category => (
        <div key={category.id} style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#555' }}>{category.name}</h3>
          {category.items && category.items.length > 0 ? (
            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
              {category.items.map(item => (
                <li key={item.id} style={{ padding: '8px 0', borderBottom: '1px dotted #ddd', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name}</span>
                  <span style={{fontWeight: 'bold'}}>{currencySymbol}{Number(item.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{fontStyle: 'italic'}}>No items in this category.</p>
          )}
        </div>
      ))}

      {uncategorizedItems && uncategorizedItems.length > 0 && (
         <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
          <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#555' }}>Other Items</h3>
            <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
              {uncategorizedItems.map(item => (
                <li key={item.id} style={{ padding: '8px 0', borderBottom: '1px dotted #ddd', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.name}</span>
                  <span style={{fontWeight: 'bold'}}>{currencySymbol}{Number(item.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
        </div>
      )}

      <footer style={{textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: `1px solid #eee` }}>
        {!restaurantData.allow_remove_branding && (
            <p style={{fontSize: '0.8em', opacity: 0.7, marginTop: '5px'}}>
              Powered by QR Menu Platform
            </p>
        )}
         <p style={{fontSize: '0.9em'}}>
            {restaurantData.custom_footer_text || `© ${new Date().getFullYear()} ${restaurantName}`}
        </p>
      </footer>
    </div>
  );
};

// DefaultFallbackTemplate.propTypes = {
//   menuData: PropTypes.object.isRequired,
//   restaurantData: PropTypes.object.isRequired,
//   templateData: PropTypes.object.isRequired,
//   baseApiUrl: PropTypes.string.isRequired,
// };

export default DefaultFallbackTemplate;
