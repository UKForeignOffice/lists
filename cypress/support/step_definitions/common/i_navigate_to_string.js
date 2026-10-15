import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I navigate to {string}", (string) => {
  cy.visit(string, { failOnStatusCode: false });
});
