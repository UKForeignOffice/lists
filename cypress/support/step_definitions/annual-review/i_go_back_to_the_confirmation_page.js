import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I go back to confirmation page", () => {
  cy.go("back");
  cy.go("back");
});
