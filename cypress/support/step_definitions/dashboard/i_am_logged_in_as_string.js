import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I am logged in as {string}", (email) => {
  cy.visit("/login");
  cy.get("#email-address").type(email);
  cy.findAllByRole("button", {
    name: "Continue",
  }).click();
});
