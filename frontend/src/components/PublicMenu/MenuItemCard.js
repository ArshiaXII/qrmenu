import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

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

const MenuItemCard = ({
  item,
  textColor,
  accentColor,
  showSection = false,
  sectionTitle,
  cardStyle: customCardStyle = {},
  currencySymbol = '₺',
  selectedLanguage = 'tr'
}) => {
  const cardStyle = {
    '--text-color': textColor,
    '--accent-color': accentColor,
    ...customCardStyle
  };

  return (
    <div className="menu-item-card" style={cardStyle}>
      <div className="item-content">
        <div className="item-details">
          {showSection && sectionTitle && (
            <div className="item-section-tag">
              {sectionTitle}
            </div>
          )}
          
          <h3 className="item-title">{getDisplayText(item.title, selectedLanguage)}</h3>

          {item.description && (
            <p className="item-description">{getDisplayText(item.description, selectedLanguage)}</p>
          )}
          
          <div className="item-price">
            {currencySymbol}{parseFloat(item.price).toFixed(2)}
          </div>
        </div>

        <div className="item-image-container">
          {item.image ? (
            <>
              <img
                src={item.image}
                alt={getDisplayText(item.title, selectedLanguage)}
                className="item-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="item-image-placeholder" style={{ display: 'none' }}>
                <PhotoIcon className="placeholder-icon" />
              </div>
            </>
          ) : (
            <div className="item-image-placeholder">
              <PhotoIcon className="placeholder-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
