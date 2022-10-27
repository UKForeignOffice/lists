/* eslint-disable */
Then("I should see an unauthorised page", () => {
  cy.findByText("User is not authorized to access this list.");
});
