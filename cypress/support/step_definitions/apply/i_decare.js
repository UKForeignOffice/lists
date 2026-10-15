import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I declare", () => {
  cy.findByText("Confirmed").click();
  cy.findByRole("button").click();
});
