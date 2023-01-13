/* eslint-disable */
When("I click the edit link for user with email {string}", (email) => {
  cy.findByRole("rowheader", { name: email })
    .parent()
    .within(() => {
      cy.findByRole("link", { name: "Edit" }).click();
    });
});
