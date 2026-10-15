import { Given } from "@badeball/cypress-cucumber-preprocessor";

const base = "http://localhost:3001/lawyers";

Given("I am applying", () => {
  cy.visit(base);
});
