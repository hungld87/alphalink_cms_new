import { prefixPluginTranslations } from '@strapi/strapi/admin';
import MathChemInput from './components/MathChemInput';
import pluginId from './pluginId';

const getTrad = (id) => `${pluginId}.${id}`;

export default {
  register(app) {
    // Register the custom field
    app.customFields.register({
      name: 'mathchem',
      pluginId: pluginId,
      type: 'text',
      intlLabel: {
        id: getTrad('mathchem.label'),
        defaultMessage: 'Math & Chemistry',
      },
      intlDescription: {
        id: getTrad('mathchem.description'),
        defaultMessage: 'Mathematical and chemical formulas with LaTeX support',
      },
      icon: 'calculator',
      Component: MathChemInput,
      options: {
        base: [
          {
            sectionTitle: {
              id: getTrad('mathchem.settings'),
              defaultMessage: 'Settings',
            },
            items: [
              {
                intlLabel: {
                  id: getTrad('mathchem.options.required'),
                  defaultMessage: 'Required field',
                },
                description: {
                  id: getTrad('mathchem.options.required.description'),
                  defaultMessage: 'Make this field required',
                },
                name: 'required',
                type: 'checkbox',
              },
              {
                intlLabel: {
                  id: getTrad('mathchem.options.placeholder'),
                  defaultMessage: 'Placeholder',
                },
                description: {
                  id: getTrad('mathchem.options.placeholder.description'),
                  defaultMessage: 'Placeholder text for the field',
                },
                name: 'placeholder',
                type: 'text',
              },
            ],
          },
          {
            sectionTitle: {
              id: getTrad('mathchem.advanced'),
              defaultMessage: 'Advanced settings',
            },
            items: [
              {
                intlLabel: {
                  id: getTrad('mathchem.options.maxLength'),
                  defaultMessage: 'Maximum length',
                },
                description: {
                  id: getTrad('mathchem.options.maxLength.description'),
                  defaultMessage: 'Maximum number of characters allowed',
                },
                name: 'maxLength',
                type: 'number',
              },
            ],
          },
        ],
        validator: (args) => ({
          // Custom validation logic if needed
        }),
      },
    });

    console.log('🧮 Math & Chemistry custom field registered successfully!');
  },

  bootstrap(app) {
    console.log('🚀 Math & Chemistry plugin admin bootstrapped!');
  },

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
