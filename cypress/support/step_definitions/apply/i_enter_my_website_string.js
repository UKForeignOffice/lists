When("I enter my website {string}", (string) => {
  cy.findByRole("textbox").type(string);
  cy.findByRole("button").click();
});
