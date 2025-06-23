import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMenu } from '../../contexts/MenuContext';
// import { useTranslation } from 'react-i18next'; // Temporarily disabled
// import LanguageSwitcher from '../Common/LanguageSwitcher'; // Temporarily disabled
import UserMenu from '../Common/UserMenu'; // Re-enabled for logout functionality
// import { Bars3Icon, MagnifyingGlassIcon, BellIcon, MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline'; // Keep actual icons commented

const Topbar = ({ toggleSidebar }) => {
  // const { t, ready } = useTranslation(); // Temporarily disabled
  const { user } = useAuth();
  const { currentRestaurant, loadDashboardMenuData } = useMenu(); // Get restaurant data

  // Simple translation function
  const t = (key, fallback = key) => {
    const translations = {
      'topbar.welcome': 'Hoş geldin'
    };
    return translations[key] || fallback;
  };
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update time every minute
    return () => clearInterval(timer);
  }, []);

  // Load restaurant data when component mounts
  useEffect(() => {
    if (user && !currentRestaurant) {
      loadDashboardMenuData();
    }
  }, [user, currentRestaurant, loadDashboardMenuData]);

  const toggleDarkModeHandler = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const formattedDate = currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

  // Helper function to truncate restaurant name if too long
  const getDisplayRestaurantName = (name) => {
    if (!name) return '';
    return name.length > 25 ? `${name.substring(0, 25)}...` : name;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 sm:h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:px-6">
      {/* Left Section: Hamburger Menu (mobile) & Welcome/Date */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-white md:hidden"
          aria-label="Open sidebar"
        >
          <span className="h-6 w-6 text-xl">☰</span> {/* Placeholder */}
        </button>
        <div className="ml-1 md:ml-2"> {/* Adjusted margin */}
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 sm:text-lg"> {/* Adjusted font size for mobile */}
            {t('topbar.welcome', 'Hoş geldin')}, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}! {/* Shorter welcome */}
          </h2>
          {/* Restaurant Name Display */}
          {currentRestaurant?.name && (
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mt-1" title={currentRestaurant.name}>
              🏪 {getDisplayRestaurantName(currentRestaurant.name)}
            </p>
          )}
          <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block sm:text-sm"> {/* Hide date/time on very small screens */}
            {formattedDate} - {formattedTime}
          </p>
        </div>
      </div>

      {/* Middle Section: Search Bar - hidden on xs, flex-grow on sm+, specific width on md+ */}
      <div className="hidden sm:flex flex-1 items-center justify-center px-2 sm:px-4 md:max-w-xs lg:max-w-md">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {/* <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /> */}
            <span className="text-gray-400">S</span> {/* Placeholder */}
          </div>
          <input
            type="search"
            name="search"
            id="search"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-3 leading-5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-purple-500 dark:focus:ring-purple-500 sm:text-sm"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section: Icons */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={toggleDarkModeHandler}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label="Toggle dark mode"
        >
          {/* {darkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />} */}
          <span className="flex h-6 w-6 items-center justify-center text-xl">{darkMode ? '☀️' : '🌙'}</span> {/* Emoji Placeholder */}
        </button>
        <button
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-white"
          aria-label="Notifications"
        >
          {/* <BellIcon className="h-6 w-6" /> */}
          <span className="flex h-6 w-6 items-center justify-center text-xl">🔔</span> {/* Emoji Placeholder */}
          {/* Optional: Notification badge */}
          {/* <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs text-white">3</span> */}
        </button>

        {/* Language Switcher - Temporarily disabled */}
        {/* <LanguageSwitcher /> */}

        {/* User Menu - Re-enabled for logout functionality */}
        <UserMenu />
      </div>
    </header>
  );
};

export default Topbar;
