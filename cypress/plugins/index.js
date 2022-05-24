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
const { logger } = require("webpack-cli/lib/utils");

const cucumber = require("cypress-cucumber-preprocessor").default;
const db = new PrismaClient();

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
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
    db: ({ operation, variables }) => {
      const [model, action] = operation.split(".");
      return db[model][action](variables);
    },
    log: (message) => {
      logger.log(message);
      return null;
    }
  });
};
