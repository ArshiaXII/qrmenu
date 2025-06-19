import React from 'react';

const StatBox = ({ stat }) => {
  const IconComponent = stat.icon;
  
  return (
    <div className={`stat-box stat-${stat.color}`}>
      <div className="stat-icon">
        <IconComponent className="w-6 h-6" />
      </div>
      
      <div className="stat-content">
        <div className="stat-value">{stat.value}</div>
        <div className="stat-label">{stat.label}</div>
      </div>
    </div>
  );
};

export default StatBox;
