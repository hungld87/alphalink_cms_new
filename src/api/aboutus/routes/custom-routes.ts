export default {
  routes: [
    {
      method: 'GET',
      path: '/aboutus/full',
      handler: 'api::aboutus.aboutus.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
