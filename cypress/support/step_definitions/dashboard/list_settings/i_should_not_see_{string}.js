/* eslint-disable */
Then("I should not see {string}", (string) => {
  cy.findAllByRole("term").should('not.contain', string);
});
