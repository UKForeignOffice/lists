Then("I see the email sent banner", () => {
  cy.findByText("All published service providers were sent a request to review their information on", { exact: false });
});
