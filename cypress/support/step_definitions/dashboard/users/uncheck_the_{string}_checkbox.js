/* eslint-disable */
And("uncheck the {string} checkbox", (checkboxName) => {
  cy.findByRole("checkbox", { name: checkboxName })
    .should("be.checked")
    .uncheck();
});
