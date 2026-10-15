import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I check the {string} checkbox", (checkButton) => {
  cy.findByRole("checkbox", { name: checkButton }).check();
});
