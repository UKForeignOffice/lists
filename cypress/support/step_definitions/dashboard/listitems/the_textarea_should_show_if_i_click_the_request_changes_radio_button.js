And("The textarea should show if I click the Request changes radio button", () => {
  cy.findByLabelText("Request changes")
    .check();
  cy.get("#message");
});
