And("I click the {string} button", (button) => {
  cy.get("button").contains(button, { exact: true }).click();
});
