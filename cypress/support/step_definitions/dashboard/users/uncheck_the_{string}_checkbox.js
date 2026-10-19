import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("uncheck the {string} checkbox", (checkboxName) => {
  cy.findByRole("checkbox", { name: checkboxName }).should("be.checked").uncheck();
});
