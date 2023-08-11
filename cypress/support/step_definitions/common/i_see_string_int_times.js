Then("I see {string} {int} times", (string, int) => {
  cy.findAllByText(string, { exact: false }).should("have.length", int);
});
