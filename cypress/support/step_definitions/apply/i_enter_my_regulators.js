import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I enter my regulators", () => {
  cy.findByRole("textbox").type("Caution Your Regulation");
  cy.findByRole("button").click();
});
