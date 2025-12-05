export default {
  register({ strapi }) {
    // Register plugin with Strapi
    console.log('🧮 Registering Math & Chemistry plugin...');
  },

  bootstrap({ strapi }) {
    // Plugin bootstrap logic
    console.log('🚀 Math & Chemistry plugin bootstrapped successfully!');
  },

  destroy({ strapi }) {
    // Cleanup logic
    console.log('🔥 Math & Chemistry plugin destroyed');
  },
};
