import React from 'react';
import { Link } from 'react-router-dom';

// Placeholder icons - replace with actual icons later
const PlaceholderIcon = () => <span className="mr-3">Icon</span>;

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  // Basic navigation items as placeholders based on the prompt
  const navigation = [
    { name: 'Dashboard', href: '/dashboard/overview', icon: PlaceholderIcon },
    { name: 'Menus', href: '/dashboard/menu', icon: PlaceholderIcon }, // Assuming /menu is the main menu management
    // Add more top-level items here later: Orders, Reservations, Feedback, Analytics, Settings
  ];

  return (
    <>
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 flex md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              {/* Heroicon name: x */}
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              {/* Replace with your logo */}
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/workflow-logo-purple-600-mark-gray-800-text.svg" // Placeholder logo
                alt="Workflow"
              />
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon aria-hidden="true" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          {/* Optional: User account area in sidebar */}
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true">{/* Dummy element to force sidebar to shrink to fit close icon */}</div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                {/* Replace with your logo */}
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/workflow-logo-purple-600-mark-gray-800-text.svg" // Placeholder logo
                  alt="Workflow"
                />
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    // Add active class styling later: e.g. 'bg-gray-100 text-gray-900'
                  >
                    <item.icon aria-hidden="true" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Optional: User account area in sidebar footer */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
