import React from 'react';
import PropTypes from 'prop-types';
import DefaultFallbackTemplate from './DefaultFallbackTemplate'; // Use fallback as a base

const ModernMinimalBaseTemplate = (props) => {
  // For now, it will render the same as the DefaultFallbackTemplate
  // but indicates that 'modern-minimal' was identified.
  console.log("[ModernMinimalBaseTemplate] Rendering for template identifier: modern-minimal");
  return <DefaultFallbackTemplate {...props} />;
};

ModernMinimalBaseTemplate.propTypes = {
  menuData: PropTypes.object.isRequired,
  restaurantData: PropTypes.object.isRequired,
  templateData: PropTypes.object.isRequired,
  baseApiUrl: PropTypes.string.isRequired,
};

export default ModernMinimalBaseTemplate;
