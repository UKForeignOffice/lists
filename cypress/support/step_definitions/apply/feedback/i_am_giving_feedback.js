const base = "/application/feedback";

Given("I am giving feedback", () => {
  cy.visit(base);
  cy.findByRole("button", { name: "Reject additional cookies" }).click();
  cy.findByRole("button").click();
});
