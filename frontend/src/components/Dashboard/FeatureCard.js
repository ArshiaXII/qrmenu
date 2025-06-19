import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const FeatureCard = ({ feature }) => {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <span>{feature.icon}</span>
      </div>
      
      <div className="feature-content">
        <h4 className="feature-title">{feature.title}</h4>
        <p className="feature-description">{feature.description}</p>
      </div>
      
      <div className="feature-arrow">
        <ArrowRightIcon className="w-5 h-5" />
      </div>
    </div>
  );
};

export default FeatureCard;
