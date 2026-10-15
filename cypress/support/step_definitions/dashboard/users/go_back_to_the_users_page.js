import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("go back to the users page", () => {
  cy.visit("/dashboard/users");
});
