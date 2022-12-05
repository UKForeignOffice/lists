/* eslint-disable */
Then("I should see the table {string}", (string) => {
  cy.findAllByRole("table", { name: string });
});
