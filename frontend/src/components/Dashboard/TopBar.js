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

const TopBar = ({ toggleSidebar, mobileMenuOpen }) => {
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
    <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 md:px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Hamburger Menu */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Desktop Sidebar Toggle */}
        <button
          className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Trial Banner - Hidden on mobile */}
        <div className="hidden lg:flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          <span className="text-sm text-yellow-800">
            {translate('topbar.trial_message', 'Deneme sürümünüzün sona ermesine 7 gün kaldı.')}
          </span>
          <button className="ml-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded font-medium transition-colors">
            {translate('topbar.upgrade', 'YÜKSELT')}
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search - Hidden on mobile */}
        <div className="hidden md:flex relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={translate('topbar.search_placeholder', 'Ara...')}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Language Selector - Hidden on mobile */}
          <div className="hidden md:block relative">
            <button
              className="flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <LanguageIcon className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{getCurrentLanguage()}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-600" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 ${i18n.language === 'tr' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                  onClick={() => changeLanguage('tr')}
                >
                  <span>🇹🇷</span>
                  <span>Türkçe</span>
                </button>
                <button
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 ${i18n.language === 'en' ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                  onClick={() => changeLanguage('en')}
                >
                  <span>🇺🇸</span>
                  <span>English</span>
                </button>
              </div>
            )}
          </div>

          {/* Apps Button - Hidden on mobile */}
          <button className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Squares2X2Icon className="w-6 h-6 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <BellIcon className="w-6 h-6 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </button>

          {/* Help Button - Hidden on mobile */}
          <button className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <QuestionMarkCircleIcon className="w-6 h-6 text-gray-600" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                <span>{getUserInitials()}</span>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-600 hidden md:block" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {/* User Info Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-medium">
                      <span>{getUserInitials()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{getUserDisplayName()}</div>
                      <div className="text-sm text-gray-500 truncate">{restaurantName}</div>
                      {user?.email && (
                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Options */}
                <div className="py-2">
                  <button
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/dashboard/settings/restaurant');
                    }}
                  >
                    <UserIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{translate('profile.settings', 'Hesap Ayarları')}</span>
                  </button>

                  <button
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      navigate('/dashboard/settings');
                    }}
                  >
                    <CogIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{translate('sidebar.settings', 'Ayarlar')}</span>
                  </button>

                  <hr className="my-2 border-gray-200" />

                  <button
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
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
