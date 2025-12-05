export default {
  routes: [
    {
      method: 'GET',
      path: '/home/full',
      handler: 'api::home.home.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
