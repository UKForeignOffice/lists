/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const cucumber = require("cypress-cucumber-preprocessor").default;

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, _config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on("file:preprocessor", cucumber());

  /**
   * To aide debugging, you can output the page HTML using the following technique:
   *     cy.get('html:root')
   *       .eq(0)
   *       .invoke('prop', 'outerHTML')
   *       .then(doc => {
   *         cy.task("log", `PAGE HTML for list items with notification: ${doc}`);
   *       });
   */
  on("task", {
    db: async ({ operation, variables }) => {
      const [model, action] = operation.split(".");
      const result = await db[model][action](variables);
      return result;
    },
    log: (message) => {
      console.log(message);
      return null;
    },
    batch: async function () {
      const childProcess = require("node:child_process");
      return childProcess.execSync("docker-compose run scheduler-batch");
    },
    worker: async function (options) {
      const childProcess = require("node:child_process");

      let commandArgs = ["run", "scheduler-annual-review-worker"];
      if (options?.futureDate) {
        commandArgs = [commandArgs[0], "-e", `TEST_DATE=${options.futureDate}`, commandArgs[1]]
      }

      return childProcess.execSync(`docker-compose ${commandArgs.join(" ")}`);
    },
  });
};
