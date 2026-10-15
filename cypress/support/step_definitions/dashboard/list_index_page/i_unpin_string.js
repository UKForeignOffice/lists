import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I unpin {string}", (name) => {
  cy.findByTestId(`unpin-${name}`).click();
});
