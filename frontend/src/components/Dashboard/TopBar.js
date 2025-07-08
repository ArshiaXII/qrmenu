import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useMenu } from '../../contexts/MenuContext';
import { useNavigate } from 'react-router-dom';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BellIcon,
  QuestionMarkCircleIcon,
  LanguageIcon,
  ChevronDownIcon,
  ArrowRightStartOnRectangleIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const TopBar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentRestaurant } = useMenu();

  // Use currentRestaurant for restaurant name display
  const restaurantName = currentRestaurant?.name || 'Restoran';

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

  // Helper function to generate user initials
  const getUserInitials = () => {
    if (user?.name) {
      const nameParts = user.name.trim().split(' ');
      if (nameParts.length >= 2) {
        // First letter of first name + first letter of last name
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else {
        // Just first two letters of the name
        return nameParts[0].substring(0, 2).toUpperCase();
      }
    } else if (user?.email) {
      // Use first two letters of email before @
      const emailPrefix = user.email.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return 'U'; // Default fallback
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

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
                <span>{getUserInitials()}</span>
              </div>
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {showProfileDropdown && (
              <div className="profile-dropdown">
                {/* User Info Header */}
                <div className="profile-header">
                  <div className="profile-info">
                    <div className="profile-avatar-large">
                      <span>{getUserInitials()}</span>
                    </div>
                    <div className="profile-details">
                      <div className="profile-name">{getUserDisplayName()}</div>
                      <div className="profile-restaurant">{restaurantName}</div>
                      {user?.email && (
                        <div className="profile-email">{user.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Options */}
                <div className="profile-options">
                  <button
                    className="profile-option"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/dashboard/settings/restaurant');
                    }}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>{translate('profile.settings', 'Hesap Ayarları')}</span>
                  </button>

                  <button
                    className="profile-option"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/dashboard/settings');
                    }}
                  >
                    <CogIcon className="w-5 h-5" />
                    <span>{translate('sidebar.settings', 'Ayarlar')}</span>
                  </button>

                  <hr className="profile-divider" />

                  <button
                    className="profile-option logout-option"
                    onClick={handleLogout}
                  >
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                    <span>{translate('button_logout', 'Çıkış Yap')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
