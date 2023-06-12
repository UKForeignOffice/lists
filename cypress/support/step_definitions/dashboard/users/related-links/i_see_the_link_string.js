Then("I see the link {string}", (link) => {
  cy.findByRole("link", { name: link });
});
