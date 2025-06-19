import { useState } from 'react';
import { LanguageIcon } from '@heroicons/react/24/outline';

// Supported languages configuration
const SUPPORTED_LANGUAGES = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const DEFAULT_LANGUAGE = 'tr';

const MultiLanguageInput = ({
  value = {},
  onChange,
  placeholder = '',
  label = '',
  type = 'input', // 'input' or 'textarea'
  required = false,
  className = ''
}) => {
  const [activeLanguage, setActiveLanguage] = useState(DEFAULT_LANGUAGE);
  const [showLanguageTabs, setShowLanguageTabs] = useState(false);

  // Ensure value is an object with language keys
  const normalizedValue = typeof value === 'string' 
    ? { [DEFAULT_LANGUAGE]: value }
    : value || {};

  // Get current value for active language
  const currentValue = normalizedValue[activeLanguage] || '';

  // Handle input change
  const handleInputChange = (newValue) => {
    const updatedValue = {
      ...normalizedValue,
      [activeLanguage]: newValue
    };
    onChange(updatedValue);
  };

  // Get language display info
  const getLanguageInfo = (langCode) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === langCode) || 
           { code: langCode, name: langCode.toUpperCase(), flag: '🌐' };
  };

  // Check if language has content
  const hasContent = (langCode) => {
    return normalizedValue[langCode] && normalizedValue[langCode].trim().length > 0;
  };

  // Get completion status
  const getCompletionStatus = () => {
    const completedLanguages = SUPPORTED_LANGUAGES.filter(lang => hasContent(lang.code));
    return `${completedLanguages.length}/${SUPPORTED_LANGUAGES.length}`;
  };

  return (
    <div className={`multi-language-input ${className}`}>
      {label && (
        <div className="input-label-container">
          <label className="input-label">
            {label}
            {required && <span className="required-asterisk">*</span>}
          </label>
          <div className="language-status">
            <LanguageIcon className="language-status-icon" />
            <span className="completion-status">{getCompletionStatus()}</span>
          </div>
        </div>
      )}

      <div className="input-container">
        {/* Language Tabs */}
        <div className="language-tabs">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`language-tab ${activeLanguage === language.code ? 'active' : ''} ${hasContent(language.code) ? 'has-content' : ''}`}
              onClick={() => setActiveLanguage(language.code)}
              title={`${language.name} - ${hasContent(language.code) ? 'İçerik var' : 'Boş'}`}
            >
              <span className="language-flag">{language.flag}</span>
              <span className="language-code">{language.code.toUpperCase()}</span>
              {hasContent(language.code) && <span className="content-indicator">●</span>}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="input-field-container">
          {type === 'textarea' ? (
            <textarea
              value={currentValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`${placeholder} (${getLanguageInfo(activeLanguage).name})`}
              className="multi-language-textarea"
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={`${placeholder} (${getLanguageInfo(activeLanguage).name})`}
              className="multi-language-input-field"
            />
          )}
          
          {/* Language Indicator */}
          <div className="active-language-indicator">
            <span className="active-language-flag">{getLanguageInfo(activeLanguage).flag}</span>
            <span className="active-language-name">{getLanguageInfo(activeLanguage).name}</span>
          </div>
        </div>

        {/* Translation Helper */}
        {activeLanguage !== DEFAULT_LANGUAGE && normalizedValue[DEFAULT_LANGUAGE] && (
          <div className="translation-helper">
            <span className="helper-label">Türkçe:</span>
            <span className="helper-text">{normalizedValue[DEFAULT_LANGUAGE]}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiLanguageInput;
