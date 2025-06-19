import React from 'react';
import { Link } from 'react-router-dom';
// import { UserCircleIcon } from '@heroicons/react/24/outline'; // Temporarily commented out
// import { Bars3Icon } from '@heroicons/react/24/solid'; // Temporarily commenting out
import { useAuth } from '../../contexts/AuthContext';

const TopNavbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-6 print:hidden">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        >
          {/* <Bars3Icon className="h-6 w-6" /> */}
          <span>MENU</span> {/* Placeholder for Bars3Icon */}
        </button>
        <Link to="/dashboard/overview" className="ml-3">
          <span className="text-xl font-semibold text-gray-800">QR Menu</span>
        </Link>
      </div>

      <div className="relative hidden md:block w-full max-w-xs lg:max-w-sm ml-auto mr-4">
        <input
          type="text"
          name="global-search"
          id="global-search"
          placeholder="Search... (not active)"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex items-center space-x-2 md:space-x-3">
        <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hidden sm:inline-flex">
          {/* Placeholder for View Toggle Icon */}
          <span>VT</span>
        </button>
        <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hidden sm:inline-flex">
          {/* Placeholder for Help Icon */}
          <span>H</span>
        </button>
        <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {/* Placeholder for Notifications Icon */}
          <span>N</span>
        </button>

        <div className="relative">
          <button 
            className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            id="user-menu-button"
            aria-expanded="false" 
            aria-haspopup="true"
            onClick={handleLogout}
          >
            <span className="sr-only">Open user menu</span>
            {user?.avatarUrl ? (
              <img className="h-8 w-8 rounded-full" src={user.avatarUrl} alt="User" />
            ) : (
              // <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-gray-500" />
              <span>User</span> /* Placeholder for UserCircleIcon */
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar; 