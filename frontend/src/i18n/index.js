import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import trTranslation from '../locales/tr/translation.json';
import enTranslation from '../locales/en/translation.json';

const resources = {
  tr: {
    translation: trTranslation
  },
  en: {
    translation: enTranslation
  }
};

// Initialize i18n synchronously
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,

    // Default language
    fallbackLng: 'tr',
    lng: 'tr', // Default to Turkish, let LanguageDetector handle the rest

    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],

      // Cache user language
      caches: ['localStorage'],

      // localStorage key
      lookupLocalStorage: 'qrmenu_language',

      // Don't lookup from subdomain
      lookupFromSubdomainIndex: 0,

      // Don't lookup from path
      lookupFromPathIndex: 0,

      // Check for localStorage availability
      checkWhitelist: true,
    },

    interpolation: {
      // React already does escaping
      escapeValue: false,
    },

    // Disable debug mode for production
    debug: false,

    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],

    // Key separator
    keySeparator: '.',

    // Nested separator
    nsSeparator: ':',

    // React options
    react: {
      useSuspense: false, // Disable suspense to avoid loading issues
      bindI18n: 'languageChanged',
      bindI18nStore: '',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

export default i18n;
