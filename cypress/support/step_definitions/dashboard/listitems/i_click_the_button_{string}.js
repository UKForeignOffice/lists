And("I click the button {string}", (button) => {
  cy.get("button")
    .contains(button)
    .click();
});
