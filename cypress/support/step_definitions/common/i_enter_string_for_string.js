When("I enter {string} for {string}", (value, name) => {
  cy.findByLabelText(name).type(value);
});
