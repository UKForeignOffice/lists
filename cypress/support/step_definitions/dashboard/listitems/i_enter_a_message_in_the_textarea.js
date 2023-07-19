And("I enter a message in the textarea", () => {
  cy.get("#message").type("Please change the regulator");
});
