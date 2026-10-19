import { When } from "@badeball/cypress-cucumber-preprocessor";

When("the worker process has run", () => {
  return cy.task("worker");
});
