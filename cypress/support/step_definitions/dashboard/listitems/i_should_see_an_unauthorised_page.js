/* eslint-disable */
Then("I should see an unauthorised page", () => {
  cy.findByText("User does not have publishing rights on this list");
});
