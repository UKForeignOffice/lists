When("I enter my regulators", () => {
  cy.findByRole("textbox").type("Caution Your Regulation");
  cy.findByRole("button").click();
});
