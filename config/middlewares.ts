const externalURI = "www.wiris.net";

export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': ["'self'", "'unsafe-eval'", externalURI],
          'script-src-attr': ["'self'", "'unsafe-inline'", externalURI],
          'font-src': ["'self'", externalURI],
          'connect-src': ["'self'", 'https:', externalURI, "analytics.strapi.io"],
          'style-src': ["'self'", "'unsafe-inline'", externalURI],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            externalURI,
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
            externalURI,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
