/* eslint-disable */
Then("I should see an unauthorised page", () => {
  cy.contains("User is not authorized to access this list.");
});
