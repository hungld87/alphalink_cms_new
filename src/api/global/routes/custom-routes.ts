export default {
  routes: [
    {
      method: 'GET',
      path: '/global/full',
      handler: 'api::global.global.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
