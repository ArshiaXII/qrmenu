import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'tr');

  // Available languages
  const languages = [
    {
      code: 'tr',
      name: 'Türkçe',
      flag: '🇹🇷'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸'
    }
  ];

  // Change language function
  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      
      // Store in localStorage
      localStorage.setItem('qrmenu_language', languageCode);
      
      // Update document language attribute
      document.documentElement.lang = languageCode;
      
      console.log(`Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('qrmenu_language');
    if (savedLanguage && savedLanguage !== currentLanguage) {
      changeLanguage(savedLanguage);
    }
    
    // Set initial document language
    document.documentElement.lang = currentLanguage;
  }, []);

  // Listen to i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
      document.documentElement.lang = lng;
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    isRTL: currentLanguage === 'ar', // For future RTL support
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
