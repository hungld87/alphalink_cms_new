export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/full',
      handler: 'api::article.article.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
    {
      method: 'GET',
      path: '/articles/:documentId/related',
      handler: 'api::article.article.related',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
