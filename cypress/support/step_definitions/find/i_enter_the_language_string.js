import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I enter the language {string}", (language) => {
  cy.findByRole("combobox").type(language);
  cy.findByRole("button", { name: "Add to list" }).click();
});
