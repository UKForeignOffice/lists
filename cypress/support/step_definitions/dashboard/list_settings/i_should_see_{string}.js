/* eslint-disable */
Then("I should see {string}", (string) => {
  cy.findAllByRole("term").contains(string);
});
