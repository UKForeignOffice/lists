import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I am viewing the users page", () => {
  cy.visit("/dashboard/users", { failOnStatusCode: false });
});
