import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I click the {string} button", (button) => {
  cy.findByRole("button", { name: button }).click();
});
