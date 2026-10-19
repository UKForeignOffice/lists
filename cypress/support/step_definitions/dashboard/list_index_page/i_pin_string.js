import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I pin {string}", (name) => {
  cy.findByTestId(`pin-${name}`).click();
});
