import { When } from "@badeball/cypress-cucumber-preprocessor";

When("the batch process has run", () => {
  return cy.task("batch");
});
