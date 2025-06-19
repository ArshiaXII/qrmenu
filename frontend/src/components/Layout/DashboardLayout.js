import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // We'll create/update this
import Header from './Header';   // We'll create/update this

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile toggle

  return (
    <div className="flex h-screen bg-gray-100 font-sans"> {/* Light gray background, default font */}
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Page specific content will be rendered here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
