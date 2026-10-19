import { Then } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Then("I should not see {string}", (string) => {
  cy.findByText(string).should("not.exist");
});
