import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("check the {string} checkbox", (checkboxName) => {
  cy.findByRole("checkbox", { name: checkboxName }).should("not.be.checked").check();
});
