/* eslint-disable */
When("I visit a list that I am not a publisher of", () => {
  cy.visit(`/dashboard/lists/70/items`, { failOnStatusCode: false });
});
