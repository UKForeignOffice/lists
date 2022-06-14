And("I click the {string} radio button", (radioButton) => {
  cy.findByLabelText(radioButton, {exact: true})
    .click();
});
