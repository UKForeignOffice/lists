/* eslint-disable */
Then("I should see an unauthorised page", () => {
  cy.findByText("User is not authorised to access this list.");
});
