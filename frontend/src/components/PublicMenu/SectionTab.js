import React from 'react';

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
    <button
      className={`section-tab ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={tabStyle}
    >
      {getDisplayText(section.title, selectedLanguage)}
    </button>
  );
};

export default SectionTab;
