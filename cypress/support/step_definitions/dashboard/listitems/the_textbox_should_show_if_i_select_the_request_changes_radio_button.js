And("The textarea should show if I select the Request changes radio button", () => {
  cy.findByLabelText("Request changes")
    .check();
  cy.get("#message");
});
