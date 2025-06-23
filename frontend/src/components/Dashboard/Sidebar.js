import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const Sidebar = ({ collapsed, activeMenuItem, setActiveMenuItem, onToggle, onMenuNavigation }) => {
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
  const [expandedMenus, setExpandedMenus] = useState({});

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
    }

    // Handle navigation for specific menu items
    if (onMenuNavigation) {
      onMenuNavigation(menuItem.id);
    }
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-container">
            <span className="logo-text">finedine</span>
            <span className="restaurant-name">ww</span>
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
