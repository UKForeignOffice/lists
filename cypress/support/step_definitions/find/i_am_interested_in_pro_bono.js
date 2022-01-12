When("I am {}interested in pro bono", (not) => {
  const isInterested = !not ?? true;
  cy.findByRole("radio", { name: isInterested ? "Yes" : "No" }).click();
  cy.findByRole("button").click();
});
