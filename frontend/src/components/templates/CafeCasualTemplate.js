import React from 'react';
import PropTypes from 'prop-types';
import DefaultFallbackTemplate from './DefaultFallbackTemplate'; // Use fallback as a base

const CafeCasualTemplate = (props) => {
  // For now, it will render the same as the DefaultFallbackTemplate
  // but indicates that 'cafe-casual' was identified.
  // We can add specific Cafe Casual styling here later.
  console.log("[CafeCasualTemplate] Rendering for template identifier: cafe-casual");
  return <DefaultFallbackTemplate {...props} />;
};

CafeCasualTemplate.propTypes = {
  menuData: PropTypes.object.isRequired,
  restaurantData: PropTypes.object.isRequired,
  templateData: PropTypes.object.isRequired,
  baseApiUrl: PropTypes.string.isRequired,
};

export default CafeCasualTemplate;
