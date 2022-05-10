Given("I pin {string}", (name) => {
  cy.findByTestId(`pin-${name}`).click();
});
