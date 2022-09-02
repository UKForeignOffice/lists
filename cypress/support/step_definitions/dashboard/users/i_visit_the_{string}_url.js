/* eslint-disable */
When("I visit the {string} url", (url) => {
  cy.visit(url, { failOnStatusCode: false });
});
