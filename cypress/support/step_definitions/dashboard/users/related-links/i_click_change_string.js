When("I click Change {string}", function (link) {
  cy.findByRole("link", { name: `Change ${link}` }).click();
});
