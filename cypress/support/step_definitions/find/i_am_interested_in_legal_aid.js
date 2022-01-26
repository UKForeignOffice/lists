When("I am {}interested in legal aid", (interest) => {
  const isInterested = !interest ?? true;
  cy.findByText(isInterested ? "Yes" : "No").click();
  cy.findByRole("button").click();
});
