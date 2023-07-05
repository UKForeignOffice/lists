const base = "/find/funeral-directors";
Given("I am searching for funeral directors", () => {
  cy.visit(base);
  cy.findByRole("button", { name: "Reject analytics cookies" }).click();
});
