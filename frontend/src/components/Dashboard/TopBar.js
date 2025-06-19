import React from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  BellIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const TopBar = ({ onToggleSidebar }) => {
  return (
    <div className="topbar">
      {/* Left Section */}
      <div className="topbar-left">
        <button 
          className="mobile-menu-toggle"
          onClick={onToggleSidebar}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Trial Banner */}
        <div className="trial-banner">
          <span className="trial-text">
            Deneme sürümünüzün sona ermesine 7 gün kaldı.
          </span>
          <button className="upgrade-btn">
            YÜKSELT
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="topbar-right">
        {/* Search */}
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input 
            type="text" 
            placeholder="Ara..." 
            className="search-input"
          />
        </div>

        {/* Action Icons */}
        <div className="action-icons">
          <button className="action-btn">
            <Squares2X2Icon className="w-6 h-6" />
          </button>
          
          <button className="action-btn notification-btn">
            <BellIcon className="w-6 h-6" />
            <span className="notification-badge">3</span>
          </button>
          
          <button className="action-btn">
            <QuestionMarkCircleIcon className="w-6 h-6" />
          </button>
          
          <button className="action-btn profile-btn">
            <div className="profile-avatar">
              <span>aa</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
