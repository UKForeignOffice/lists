import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I click the {string} radio button", (radioButton) => {
  cy.findByLabelText(radioButton, { exact: true }).click();
});
