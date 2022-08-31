/* eslint-disable */
Then("I should see the {string} role assiged to {string}", (role, email) => {
  cy.findByRole("rowheader", { name: email }).parent().contains(role);
});
