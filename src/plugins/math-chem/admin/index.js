import React from 'react';
import pluginId from './pluginId';

const getTrad = (id) => `${pluginId}.${id}`;

export default {
  register(app) {
    console.log('🧮 Math-Chem Plugin Admin - Register');
    
    // Register the custom field
    app.customFields.register({
      name: 'mathchem',
      pluginId: pluginId,
      type: 'string',
      intlLabel: {
        id: getTrad('mathchem.label'),
        defaultMessage: 'Math & Chemistry',
      },
      intlDescription: {
        id: getTrad('mathchem.description'),
        defaultMessage: 'Mathematical and chemical formulas with LaTeX support',
      },
      icon: 'calculator',
      Component: () => {
        console.log('🧮 Math-Chem Component Rendering!');
        return React.createElement('div', {}, 'Math & Chemistry Field');
      },
    });
  },

  bootstrap(app) {
    console.log('🚀 Math-Chem Plugin Admin - Bootstrap');
  },
};
