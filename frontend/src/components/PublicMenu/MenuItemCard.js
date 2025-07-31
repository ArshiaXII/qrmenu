import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
    <motion.div
      className="menu-item-card"
      style={cardStyle}
      whileHover={{
        scale: 1.03,
        y: -5,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <div className="item-content">
        <motion.div
          className="item-details"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {showSection && sectionTitle && (
            <motion.div
              className="item-section-tag"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {sectionTitle}
            </motion.div>
          )}

          <motion.h3
            className="item-title"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {getDisplayText(item.title, selectedLanguage)}
          </motion.h3>

          {item.description && (
            <motion.p
              className="item-description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {getDisplayText(item.description, selectedLanguage)}
            </motion.p>
          )}

          <motion.div
            className="item-price"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {currencySymbol}{parseFloat(item.price).toFixed(2)}
          </motion.div>
        </motion.div>

        <motion.div
          className="item-image-container"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
