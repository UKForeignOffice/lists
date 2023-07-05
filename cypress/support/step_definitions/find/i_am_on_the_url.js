Then("I am on the url {string}", (url) => {
  cy.url().should("contain", url);
});
