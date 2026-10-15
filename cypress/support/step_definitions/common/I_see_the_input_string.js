import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see the input {string}", (string) => {
  cy.findByRole("textbox", { name: string });
});
