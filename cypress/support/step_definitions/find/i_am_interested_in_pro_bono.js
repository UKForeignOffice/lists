When("I am {}interested in pro bono", (interest) => {
  const isInterested = interest ?? true;
  cy.findByText(isInterested ? "Yes" : "No").click();
  cy.findByRole("button").click();
});
