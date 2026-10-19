import { Then } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Then("I should see nothing assigned to {string}", (email) => {
  cy.findByRole("rowheader", { name: email })
    .parent()
    .within(() => {
      cy.findByRole("cell", { name: "" }).should("be.empty");
    });
});
