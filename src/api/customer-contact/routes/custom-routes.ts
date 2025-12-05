export default {
  routes: [
    {
      method: 'POST',
      path: '/customer-contacts/submit',
      handler: 'api::customer-contact.customer-contact.submit',
      config: {
        policies: [],
        middlewares: [],
        auth: false
      },
    },
  ],
};
