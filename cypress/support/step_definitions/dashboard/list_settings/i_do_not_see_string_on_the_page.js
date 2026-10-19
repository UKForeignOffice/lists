import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I do not see {string} on the page", (string) => {
  cy.findByText(string).should("not.exist");
});
