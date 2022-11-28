/* eslint-disable */
Given("I am viewing the users page", () => {
  Cypress.config({
    failOnStatusCode: false,
  });
  cy.visit("/dashboard/users");
});
