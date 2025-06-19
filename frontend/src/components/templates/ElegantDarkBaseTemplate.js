import React from 'react';
import PropTypes from 'prop-types';
import DefaultFallbackTemplate from './DefaultFallbackTemplate'; // Use fallback as a base

const ElegantDarkBaseTemplate = (props) => {
  // For now, it will render the same as the DefaultFallbackTemplate
  // but indicates that 'elegant-dark' was identified.
  console.log("[ElegantDarkBaseTemplate] Rendering for template identifier: elegant-dark");
  return <DefaultFallbackTemplate {...props} />;
};

ElegantDarkBaseTemplate.propTypes = {
  menuData: PropTypes.object.isRequired,
  restaurantData: PropTypes.object.isRequired,
  templateData: PropTypes.object.isRequired,
  baseApiUrl: PropTypes.string.isRequired,
};

export default ElegantDarkBaseTemplate;
