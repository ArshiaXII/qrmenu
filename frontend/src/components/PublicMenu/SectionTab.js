import React from 'react';
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

const SectionTab = ({ section, isActive, onClick, accentColor, selectedLanguage = 'tr' }) => {
  const tabStyle = {
    '--accent-color': accentColor
  };

  return (
    <motion.button
      className={`section-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={tabStyle}
      whileHover={{
        scale: 1.05,
        y: -2,
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
      }}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? {
        scale: 1.02,
        backgroundColor: "rgba(255, 255, 255, 1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
      } : {
        scale: 1,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      {getDisplayText(section.title, selectedLanguage)}
    </motion.button>
  );
};

export default SectionTab;
