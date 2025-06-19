import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DashboardContent from './DashboardContent';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');

  // Function to determine active menu item based on current route
  const getActiveMenuFromRoute = (pathname) => {
    if (pathname.startsWith('/dashboard/menu')) {
      // All menu-related routes should highlight "Menü Yönetimi"
      // This includes: /dashboard/menu-management, /dashboard/menu/create, /dashboard/menu/customize, etc.
      return 'Menü Yönetimi';
    } else if (pathname.startsWith('/dashboard/reports')) {
      return 'Raporlar';
    } else if (pathname.startsWith('/dashboard/suggestions')) {
      return 'Öneriler';
    } else if (pathname.startsWith('/dashboard/orders')) {
      return 'Siparişler';
    } else if (pathname.startsWith('/dashboard/reservations')) {
      return 'Rezervasyonlar';
    } else if (pathname.startsWith('/dashboard/interaction')) {
      return 'Etkileşim';
    } else if (pathname.startsWith('/dashboard/feedback')) {
      return 'Geri Bildirimler';
    } else if (pathname.startsWith('/dashboard/translation')) {
      return 'Çeviri Merkezi';
    } else if (pathname.startsWith('/dashboard/marketplace')) {
      return 'Pazaryeri';
    } else if (pathname.startsWith('/dashboard/settings')) {
      return 'Ayarlar';
    } else {
      // Default to Dashboard for /dashboard or /dashboard/overview
      return 'Dashboard';
    }
  };

  // Update active menu item when route changes
  useEffect(() => {
    const activeMenu = getActiveMenuFromRoute(location.pathname);
    setActiveMenuItem(activeMenu);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuNavigation = (menuId) => {
    // Navigate to appropriate routes based on menu selection
    switch (menuId) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Menü Yönetimi':
        navigate('/dashboard/menu-management');
        break;
      case 'Raporlar':
        navigate('/dashboard/reports');
        break;
      case 'Öneriler':
        navigate('/dashboard/suggestions');
        break;
      case 'Siparişler':
        navigate('/dashboard/orders');
        break;
      case 'Rezervasyonlar':
        navigate('/dashboard/reservations');
        break;
      case 'Etkileşim':
        navigate('/dashboard/interaction');
        break;
      case 'Geri Bildirimler':
        navigate('/dashboard/feedback');
        break;
      case 'Çeviri Merkezi':
        navigate('/dashboard/translation');
        break;
      case 'Pazaryeri':
        navigate('/dashboard/marketplace');
        break;
      case 'Ayarlar':
        navigate('/dashboard/settings');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        onToggle={toggleSidebar}
        onMenuNavigation={handleMenuNavigation}
      />

      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar onToggleSidebar={toggleSidebar} />
        <DashboardContent />
      </div>
    </div>
  );
};

export default DashboardPage;
