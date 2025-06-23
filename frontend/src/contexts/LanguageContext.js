import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Initialize from localStorage or default to 'tr'
    const saved = localStorage.getItem('qrmenu_language');
    return saved || 'tr';
  });

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
      // Change i18n language
      await i18n.changeLanguage(languageCode);

      // Update state
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
    const initializeLanguage = async () => {
      try {
        // Set i18n to current language
        if (i18n.language !== currentLanguage) {
          await i18n.changeLanguage(currentLanguage);
        }

        // Set document language
        document.documentElement.lang = currentLanguage;
      } catch (error) {
        console.error('Error initializing language:', error);
      }
    };

    initializeLanguage();
  }, [currentLanguage]);

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
