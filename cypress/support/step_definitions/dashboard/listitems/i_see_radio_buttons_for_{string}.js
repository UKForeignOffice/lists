import { Given, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I see radio buttons {string}", (radioButtons) => {
  const items = radioButtons.split(",");
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: true });
    }
  }
});

Given("I do not see radio buttons {string}", (radioButtons) => {
  const items = radioButtons.split(",");
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: true }).should("not.exist");
    }
  }
});
