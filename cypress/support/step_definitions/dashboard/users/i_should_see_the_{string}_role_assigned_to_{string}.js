/* eslint-disable */
Then("I should see the {string} role assigned to {string}", (role, email) => {
  cy.findByRole("rowheader", { name: email }).parent().contains(role);
});
