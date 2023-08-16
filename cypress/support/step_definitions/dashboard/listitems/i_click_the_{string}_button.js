And("I click the {string} button", (button) => {
  cy.findByRole("button", { name: button }).click();
});
