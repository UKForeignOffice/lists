const base = "http://localhost:3000/application/feedback";

Given("I am giving feedback", () => {
  cy.visit(base);
  cy.findByRole("button", { name: "Reject analytics cookies" }).click();
  cy.findByRole("button").click();
});
