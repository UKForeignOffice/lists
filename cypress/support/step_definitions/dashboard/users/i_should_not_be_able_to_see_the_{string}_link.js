/* eslint-disable */
Then("I should not be able to see the {string} link", (linkName) => {
  cy.findByRole("link", { name: linkName }).should("not.exist");
});
