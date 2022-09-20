/* eslint-disable */
Then("I should see an unauthorised page", () => {
  cy.findByRole("heading", { name: "User does not have publishing rights on this list" });
});
