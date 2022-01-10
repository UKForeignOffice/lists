When("I am {}interested in pro bono", (not) => {
  const isInterested = !not ?? true;
  cy.findByText(isInterested ? "Yes" : "No").click();
  cy.findByRole("radio", { name: isInterested ? "Yes" : "No" }).click();
  cy.findByRole("button").click();
});
