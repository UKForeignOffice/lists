import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I should be denied permission", () => {
  cy.findByText("Not allowed", { exact: false });
});
