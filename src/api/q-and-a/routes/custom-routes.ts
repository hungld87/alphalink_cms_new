export default {
  routes: [
    {
      method: 'GET',
      path: '/q-and-a/full',
      handler: 'api::q-and-a.q-and-a.full',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
