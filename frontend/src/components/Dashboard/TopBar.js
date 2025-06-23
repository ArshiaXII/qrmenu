import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BellIcon,
  QuestionMarkCircleIcon,
  LanguageIcon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon
} from '@heroicons/react/24/outline';

const TopBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Safe translation hook with fallback
  let t, i18n;
  try {
    const translation = useTranslation();
    t = translation.t;
    i18n = translation.i18n;
  } catch (error) {
    console.warn('Translation hook error:', error);
    t = (key, fallback) => fallback || key;
    i18n = { language: 'tr', changeLanguage: () => {} };
  }

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Fallback translation function
  const translate = (key, fallback) => {
    try {
      const result = t(key);
      // If translation returns the key itself, use fallback
      return result === key ? fallback : result;
    } catch (error) {
      console.warn('Translation error:', error);
      return fallback || key;
    }
  };

  const changeLanguage = (lng) => {
    try {
      console.log('Changing language to:', lng);
      if (i18n && i18n.changeLanguage) {
        // Update i18n language
        i18n.changeLanguage(lng);
        // Persist to localStorage
        localStorage.setItem('qrmenu_language', lng);
        // No need to reload - i18n will handle re-rendering
      }
      setShowLanguageDropdown(false);
    } catch (error) {
      console.warn('Language change error:', error);
      setShowLanguageDropdown(false);
    }
  };

  const getCurrentLanguage = () => {
    try {
      const currentLang = i18n?.language || localStorage.getItem('qrmenu_language') || 'tr';
      return currentLang === 'en' ? 'EN' : 'TR';
    } catch (error) {
      return 'TR'; // Default fallback
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigation even if logout fails
      navigate('/login');
    }
    setShowProfileDropdown(false);
  };

  return (
    <div className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Trial Banner */}
        <div className="trial-banner">
          <span className="trial-text">
            {translate('topbar.trial_message', 'Deneme sürümünüzün sona ermesine 7 gün kaldı.')}
          </span>
          <button className="upgrade-btn">
            {translate('topbar.upgrade', 'YÜKSELT')}
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Search */}
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder={translate('topbar.search_placeholder', 'Ara...')}
            className="search-input"
          />
        </div>

        {/* Action Icons */}
        <div className="action-icons">
          {/* Language Selector */}
          <div className="language-selector">
            <button
              className="action-btn language-btn"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <LanguageIcon className="w-5 h-5" />
              <span className="language-text">{getCurrentLanguage()}</span>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showLanguageDropdown && (
              <div className="language-dropdown">
                <button
                  className={`language-option ${i18n.language === 'tr' ? 'active' : ''}`}
                  onClick={() => changeLanguage('tr')}
                >
                  <span className="flag">🇹🇷</span>
                  <span>Türkçe</span>
                </button>
                <button
                  className={`language-option ${i18n.language === 'en' ? 'active' : ''}`}
                  onClick={() => changeLanguage('en')}
                >
                  <span className="flag">🇺🇸</span>
                  <span>English</span>
                </button>
              </div>
            )}
          </div>

          <button className="action-btn">
            <Squares2X2Icon className="w-6 h-6" />
          </button>

          <button className="action-btn notification-btn">
            <BellIcon className="w-6 h-6" />
            <span className="notification-badge">3</span>
          </button>

          <button className="action-btn">
            <QuestionMarkCircleIcon className="w-6 h-6" />
          </button>

          {/* Profile Dropdown */}
          <div className="profile-container">
            <button
              className="action-btn profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="profile-avatar">
                <span>aa</span>
              </div>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button
                  className="profile-option logout-option"
                  onClick={handleLogout}
                >
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                  <span>{translate('button_logout', 'Çıkış Yap')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
