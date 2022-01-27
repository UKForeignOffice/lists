When("I declare", () => {
  cy.findByText("Confirmed").click();
  cy.findByRole("button").click();
});
