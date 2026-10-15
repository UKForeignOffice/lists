import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I add {string} as a user", (string) => {
  cy.findByLabelText("Enter an FCDO email address").type(string);
  cy.findByRole("button", { name: "Add to list" }).click();
});
