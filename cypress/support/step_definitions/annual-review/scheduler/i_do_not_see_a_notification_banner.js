/* eslint-disable */
And("I do not see a notification banner", () => {
    cy.findByRole("region").should('not.contain', 'Annual review')
  });
