import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I click the link {string}", (string) => {
  cy.findAllByRole("link", {
    name: string,
  }).click();
});
