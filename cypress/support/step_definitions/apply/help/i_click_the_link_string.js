When("I click the link {string}", (string) => {
  cy.findAllByRole("link", {
    name: string,
  }).click();
});
