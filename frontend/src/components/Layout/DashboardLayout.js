import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../Dashboard/Sidebar'; // Use the new Dashboard Sidebar
import Topbar from '../Dashboard/TopBar'; // Use the new Dashboard TopBar
import '../Dashboard/DashboardPage.css'; // Import dashboard styles

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('Dashboard');

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false); // Close mobile menu on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setCollapsed(!collapsed);
    }
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileMenuOpen={mobileMenuOpen}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        onToggle={toggleSidebar}
        onMenuNavigation={handleMenuNavigation}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        {/* Topbar */}
        <Topbar
          toggleSidebar={toggleSidebar}
          mobileMenuOpen={mobileMenuOpen}
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
