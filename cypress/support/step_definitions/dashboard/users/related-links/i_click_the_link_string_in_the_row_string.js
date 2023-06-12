When("I click the link {string} in the row with header {string}", (link, header) => {
  cy.findByRole("cell", { name: header })
    .parent()
    .within(() => {
      cy.findByRole("link", { name: link }).click();
    });
});
