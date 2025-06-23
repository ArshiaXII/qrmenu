import React from 'react';
import DashboardContent from './DashboardContent';
import './DashboardPage.css';

const DashboardPage = () => {
  // This component now only renders DashboardContent
  // Layout, Sidebar, and TopBar are handled by DashboardLayout



  return (
    <div className="dashboard-page">
      {/* DashboardContent only - Sidebar and TopBar are handled by DashboardLayout */}
      <DashboardContent />
    </div>
  );
};

export default DashboardPage;
