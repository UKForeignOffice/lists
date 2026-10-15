import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I choose the country {string}", (country) => {
  cy.findByRole("combobox").type(country);
});
