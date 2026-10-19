import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see {string}", (string) => {
  cy.findByText(string, { exact: false });
});
