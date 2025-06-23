import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next'; // Temporarily disabled
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserCircleIcon, 
  ChevronDownIcon, 
  ArrowRightOnRectangleIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const UserMenu = ({ className = '' }) => {
  // const { t, ready } = useTranslation(); // Temporarily disabled
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Static translations for logout functionality
  const translations = {
    'topbar.profile': 'Profil',
    'sidebar.settings': 'Ayarlar',
    'auth.logout': 'Çıkış Yap',
    'auth.logout_confirm': 'Çıkış yapmak istediğinizden emin misiniz?',
    'common.cancel': 'İptal'
  };

  // Simple translation function
  const t = (key, fallback = key) => {
    return translations[key] || fallback;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowLogoutConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout from AuthContext (this will clear authToken and authUser)
      if (logout) {
        logout();
      }

      // Clear any additional tokens that might exist
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear any other user-specific data
      sessionStorage.clear();

      // Close the dropdown
      setIsOpen(false);
      setShowLogoutConfirm(false);

      // Redirect to login page
      navigate('/login', { replace: true });

      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still redirect even if there's an error
      navigate('/login', { replace: true });
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
        aria-label={t('topbar.profile', 'Profil')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <UserCircleIcon className="w-5 h-5" />
        <span className="hidden sm:inline max-w-24 truncate">
          {getUserDisplayName()}
        </span>
        <ChevronDownIcon 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard/settings/restaurant');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span>{t('topbar.profile', 'Profil')}</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard/settings');
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CogIcon className="w-4 h-4" />
              <span>{t('sidebar.settings', 'Ayarlar')}</span>
            </button>

            <hr className="my-1 border-gray-100" />

            {/* Logout Button */}
            {!showLogoutConfirm ? (
              <button
                onClick={confirmLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>{t('auth.logout', 'Çıkış Yap')}</span>
              </button>
            ) : (
              <div className="px-4 py-3 bg-red-50">
                <p className="text-sm text-red-800 mb-3">
                  {t('auth.logout_confirm', 'Çıkış yapmak istediğinizden emin misiniz?')}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                  >
                    {t('auth.logout', 'Çıkış Yap')}
                  </button>
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  >
                    {t('common.cancel', 'İptal')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
