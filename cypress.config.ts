import { defineConfig } from "cypress";

export default defineConfig({
  chromeWebSecurity: false,
  video: false, // change to true if debug required (.circleci.yml)
  projectId: "fo4z8h",
  expose: {
    tags: "not @wip",
  },
  e2e: {
    async setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: "cypress/e2e/**/*.feature",
  },
});
