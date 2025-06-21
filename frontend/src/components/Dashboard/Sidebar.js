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
  const { t } = useTranslation();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

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
    { id: 'Dashboard', label: t('sidebar.dashboard'), icon: HomeIcon, hasSubmenu: false },
    { id: 'Raporlar', label: t('sidebar.reports'), icon: ChartBarIcon, hasSubmenu: false },
    { id: 'Öneriler', label: t('sidebar.suggestions'), icon: LightBulbIcon, hasSubmenu: false },
    {
      id: 'Siparişler',
      label: t('sidebar.orders'),
      icon: ListBulletIcon,
      hasSubmenu: true,
      submenu: ['Tüm Siparişler', 'Bekleyen Siparişler', 'Tamamlanan Siparişler']
    },
    {
      id: 'Rezervasyonlar',
      label: t('sidebar.reservations'),
      icon: CalendarIcon,
      hasSubmenu: true,
      submenu: ['Tüm Rezervasyonlar', 'Bugünkü Rezervasyonlar', 'Gelecek Rezervasyonlar']
    },
    {
      id: 'Etkileşim',
      label: t('sidebar.interaction'),
      icon: UsersIcon,
      hasSubmenu: true,
      submenu: ['Müşteri Yorumları', 'Sosyal Medya', 'Analitik']
    },
    { id: 'Menü Yönetimi', label: t('sidebar.menu_management'), icon: BookOpenIcon, hasSubmenu: false },
    { id: 'Geri Bildirimler', label: t('sidebar.feedback'), icon: ChatBubbleLeftRightIcon, hasSubmenu: false },
    { id: 'Çeviri Merkezi', label: t('sidebar.translation_center'), icon: LanguageIcon, hasSubmenu: false },
    { id: 'Pazaryeri', label: t('sidebar.marketplace'), icon: BuildingStorefrontIcon, hasSubmenu: false },
    {
      id: 'Ayarlar',
      label: t('sidebar.settings'),
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
