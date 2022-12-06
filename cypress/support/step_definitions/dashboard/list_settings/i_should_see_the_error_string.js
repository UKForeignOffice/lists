/* eslint-disable */
Then("I should see the error {string}", (string) => {
  cy.findByRole("alert").contains(string);
});
