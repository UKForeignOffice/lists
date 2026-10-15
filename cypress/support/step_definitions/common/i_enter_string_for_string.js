import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I enter {string} for {string}", (value, name) => {
  cy.findByLabelText(name).type(value);
});
