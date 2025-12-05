export default {
  routes: [
    {
      method: 'GET',
      path: '/services/full',
      handler: 'api::service.service.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
