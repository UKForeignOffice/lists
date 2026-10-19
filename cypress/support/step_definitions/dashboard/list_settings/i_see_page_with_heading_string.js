import { Given } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Given("I see page with heading {string}", (pageHeading) => {
  cy.findByRole("heading", { name: pageHeading });
});
