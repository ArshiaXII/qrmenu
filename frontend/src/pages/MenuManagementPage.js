import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import TopBar from '../components/Dashboard/TopBar';
import MenuManagementContent from '../components/Dashboard/MenuManagementContent';
import '../components/Dashboard/DashboardPage.css';

const MenuManagementPage = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Menü Yönetimi');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuNavigation = (menuId) => {
    if (menuId === 'Menü Yönetimi') {
      navigate('/dashboard/menu-management');
    } else if (menuId === 'Dashboard') {
      navigate('/dashboard');
    } else {
      // Handle other menu items
      navigate('/dashboard');
    }
  };

  return (
    <div className="dashboard-page">
      <Sidebar
        collapsed={sidebarCollapsed}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        onMenuNavigation={handleMenuNavigation}
      />

      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar onToggleSidebar={toggleSidebar} />
        <MenuManagementContent />
      </div>
    </div>
  );
};

export default MenuManagementPage;
