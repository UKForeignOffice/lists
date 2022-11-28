export default {
  chromeWebSecurity: false,
  video: true,
  projectId: "fo4z8h",
  failOnStatusCode: false,
  env: {
    TAGS: "not @wip",
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: "cypress/e2e/**/*.feature",
  },
};
