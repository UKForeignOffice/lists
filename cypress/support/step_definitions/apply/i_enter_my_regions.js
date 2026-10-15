import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I enter my regions {string}", (string) => {
  cy.findByRole("textbox").type(string);
  cy.findByRole("button").click();
});
