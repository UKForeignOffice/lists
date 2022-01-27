When(
  "I {string} provide legal services and support to customers in English",
  (string) => {
    const canProvide = string === "can";
    cy.findByLabelText(canProvide ? "Yes" : "No").click();
    cy.findByRole("button").click();
  }
);

When("I {string} provide legal aid", (string) => {
  const canProvide = string === "can";
  cy.findByText(canProvide ? "Yes" : "No", { exact: false }).click();
  cy.findByRole("button").click();
});

When("I {string} provide pro bono", (string) => {
  const canProvide = string === "can";
  cy.findByText(canProvide ? "Yes" : "No", { exact: false }).click();
  cy.findByRole("button").click();
});
