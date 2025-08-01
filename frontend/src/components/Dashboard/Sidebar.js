import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useMenu } from '../../contexts/MenuContext';
import {
  HomeIcon,
  ChartBarIcon,
  LightBulbIcon,
  ListBulletIcon,
  CalendarIcon,
  UsersIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  BuildingStorefrontIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const Sidebar = ({
  collapsed,
  mobileMenuOpen,
  activeMenuItem,
  setActiveMenuItem,
  onToggle,
  onMenuNavigation,
  onMobileClose
}) => {
  // Safe translation hook with fallback
  let t;
  try {
    const translation = useTranslation();
    t = translation.t;
  } catch (error) {
    console.warn('Translation hook error:', error);
    t = (key, fallback) => fallback || key;
  }

  const location = useLocation();
  const { user } = useAuth();
  const { currentRestaurant, loadDashboardMenuData } = useMenu();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Load restaurant data when component mounts
  useEffect(() => {
    if (user && !currentRestaurant) {
      loadDashboardMenuData();
    }
  }, [user, currentRestaurant, loadDashboardMenuData]);

  // Helper function to get restaurant display name
  const getRestaurantDisplayName = () => {
    if (currentRestaurant?.name) {
      // Truncate long names for display
      return currentRestaurant.name.length > 20
        ? currentRestaurant.name.substring(0, 20) + '...'
        : currentRestaurant.name;
    }
    return 'Restaurant'; // Default fallback
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

  // Function to get current sub-page info for menu management
  // Only show sub-page indicators for actual sub-pages, not the main menu management page
  const getMenuSubPageInfo = () => {
    if (location.pathname === '/dashboard/menu/create') {
      return 'Menü Oluştur';
    } else if (location.pathname === '/dashboard/menu/customize') {
      return 'Tasarım Özelleştir';
    }
    // Don't show indicator for main menu management page (/dashboard/menu-management)
    return null;
  };

  const menuItems = [
    { id: 'Dashboard', label: translate('sidebar.dashboard', 'Kontrol Paneli'), icon: HomeIcon, hasSubmenu: false },
    { id: 'Raporlar', label: translate('sidebar.reports', 'Raporlar'), icon: ChartBarIcon, hasSubmenu: false },
    { id: 'Öneriler', label: translate('sidebar.suggestions', 'Öneriler'), icon: LightBulbIcon, hasSubmenu: false },
    {
      id: 'Siparişler',
      label: translate('sidebar.orders', 'Siparişler'),
      icon: ListBulletIcon,
      hasSubmenu: true,
      submenu: ['Tüm Siparişler', 'Bekleyen Siparişler', 'Tamamlanan Siparişler']
    },
    {
      id: 'Rezervasyonlar',
      label: translate('sidebar.reservations', 'Rezervasyonlar'),
      icon: CalendarIcon,
      hasSubmenu: true,
      submenu: ['Tüm Rezervasyonlar', 'Bugünkü Rezervasyonlar', 'Gelecek Rezervasyonlar']
    },
    {
      id: 'Etkileşim',
      label: translate('sidebar.interaction', 'Etkileşim'),
      icon: UsersIcon,
      hasSubmenu: true,
      submenu: ['Müşteri Yorumları', 'Sosyal Medya', 'Analitik']
    },
    { id: 'Menü Yönetimi', label: translate('sidebar.menu_management', 'Menü Yönetimi'), icon: BookOpenIcon, hasSubmenu: false },
    { id: 'Geri Bildirimler', label: translate('sidebar.feedback', 'Geri Bildirimler'), icon: ChatBubbleLeftRightIcon, hasSubmenu: false },
    { id: 'Çeviri Merkezi', label: translate('sidebar.translation_center', 'Çeviri Merkezi'), icon: LanguageIcon, hasSubmenu: false },
    { id: 'Pazaryeri', label: translate('sidebar.marketplace', 'Pazaryeri'), icon: BuildingStorefrontIcon, hasSubmenu: false },
    {
      id: 'Ayarlar',
      label: translate('sidebar.settings', 'Ayarlar'),
      icon: CogIcon,
      hasSubmenu: true,
      submenu: ['Genel Ayarlar', 'Hesap Ayarları', 'Bildirim Ayarları', 'Güvenlik']
    }
  ];

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleMenuClick = (menuItem) => {
    setActiveMenuItem(menuItem.id);
    if (menuItem.hasSubmenu) {
      toggleSubmenu(menuItem.id);
    } else {
      // Close mobile menu when item is selected
      if (onMobileClose && window.innerWidth < 768) {
        onMobileClose();
      }
    }

    // Handle navigation for specific menu items
    if (onMenuNavigation) {
      onMenuNavigation(menuItem.id);
    }
  };

  return (
    <div className={`
      fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
      ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:static md:z-auto
      ${collapsed ? 'md:w-20' : 'md:w-70'}
      w-70 shadow-lg md:shadow-none
    `}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-container">
            <span className="logo-text">finedine</span>
            {!collapsed && currentRestaurant?.name && (
              <span className="restaurant-name" title={currentRestaurant.name}>
                {getRestaurantDisplayName()}
              </span>
            )}
            {collapsed && currentRestaurant?.name && (
              <span className="restaurant-name-collapsed" title={currentRestaurant.name}>
                {currentRestaurant.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <button
            className="sidebar-toggle"
            onClick={onToggle}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenuItem === item.id;
            const isExpanded = expandedMenus[item.id];
            const menuSubPageInfo = item.id === 'Menü Yönetimi' ? getMenuSubPageInfo() : null;

            return (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item)}
                >
                  <div className="nav-link-content">
                    <IconComponent className="nav-icon" />
                    {!collapsed && (
                      <>
                        <span className="nav-label">{item.label}</span>
                        {item.hasSubmenu && (
                          <div className="submenu-arrow">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-4 h-4" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </button>

                {/* Show current sub-page for Menu Management */}
                {isActive && menuSubPageInfo && !collapsed && (
                  <div className="current-subpage">
                    <span className="subpage-indicator">→ {menuSubPageInfo}</span>
                  </div>
                )}

                {/* Submenu */}
                {item.hasSubmenu && isExpanded && !collapsed && (
                  <ul className="submenu">
                    {item.submenu.map((subItem, index) => (
                      <li key={index} className="submenu-item">
                        <button className="submenu-link">
                          {subItem}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
