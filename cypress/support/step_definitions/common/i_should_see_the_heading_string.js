import { Then } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Then("I should see the heading {string}", (string) => {
  cy.findAllByRole("heading", { name: string }).contains(string);
});
