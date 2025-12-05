import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
  },
  bootstrap(app: StrapiApp) {
    console.log('🚀 Admin bootstrapped, plugins should be loaded automatically');
  },
};
