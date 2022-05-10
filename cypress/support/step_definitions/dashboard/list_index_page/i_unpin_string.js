Given("I unpin {string}", (name) => {
  cy.findByTestId(`unpin-${name}`).click();
});
