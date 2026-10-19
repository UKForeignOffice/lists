import { Given } from "@badeball/cypress-cucumber-preprocessor";

const base = "/find/translators-interpreters";
Given("I am searching for translators or interpreters", () => {
  cy.visit(base);
  cy.findByRole("button", { name: "Reject analytics cookies" }).click();
});
