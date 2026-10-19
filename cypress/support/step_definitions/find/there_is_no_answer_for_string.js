import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("there is no answer for {string}", (label) => {
  cy.findByLabelText(label).should("not.exist");
});
