import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/Sidebar'; // Use the new Dashboard Sidebar
import Topbar from '../Dashboard/TopBar'; // Use the new Dashboard TopBar
import '../Dashboard/DashboardPage.css'; // Import dashboard styles

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleMenuNavigation = (menuId) => {
    setActiveMenuItem(menuId);

    // Navigate to appropriate routes
    switch (menuId) {
      case 'Dashboard':
        navigate('/dashboard/overview');
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
      case 'Geri Bildirimler':
        navigate('/dashboard/feedback');
        break;
      case 'Çeviri Merkezi':
        navigate('/dashboard/translation');
        break;
      case 'Pazaryeri':
        navigate('/dashboard/marketplace');
        break;
      default:
        // For menu items with submenus, don't navigate
        break;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        onToggle={toggleSidebar}
        onMenuNavigation={handleMenuNavigation}
      />

      {/* Content area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <Topbar toggleSidebar={toggleSidebar} />

        {/* Main content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
