When("I navigate to {string}", (string) => {
  cy.visit(string, { failOnStatusCode: false });
});
