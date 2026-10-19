import { Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see the start banner", () => {
  cy.findByText("Annual review will start on", { exact: false });
});
