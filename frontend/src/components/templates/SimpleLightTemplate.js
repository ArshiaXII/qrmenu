import React from 'react';
import PropTypes from 'prop-types';
import DefaultFallbackTemplate from './DefaultFallbackTemplate'; // Use fallback as a base

const SimpleLightTemplate = (props) => {
  // For now, it will render the same as the DefaultFallbackTemplate
  // but indicates that 'simple-light' was identified.
  console.log("[SimpleLightTemplate] Rendering for template identifier: simple-light");
  return <DefaultFallbackTemplate {...props} />;
};

SimpleLightTemplate.propTypes = {
  menuData: PropTypes.object.isRequired,
  restaurantData: PropTypes.object.isRequired,
  templateData: PropTypes.object.isRequired,
  baseApiUrl: PropTypes.string.isRequired,
};

export default SimpleLightTemplate;
