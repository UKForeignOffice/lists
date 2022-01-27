When("I enter my email with {string}", (alternative) => {
  const hasAlternativeEmail = alternative.length > 0;

  cy.findByRole("textbox").type(`smoke+${Date.now()}@cyb.dev`);
  cy.findByText(!hasAlternativeEmail ? "Yes" : "No, I", {
    exact: false,
  }).click();
  cy.findByRole("button").click();
  if (hasAlternativeEmail) {
    cy.findByRole("textbox").type(alternative);
    cy.findByRole("button").click();
  }
});
