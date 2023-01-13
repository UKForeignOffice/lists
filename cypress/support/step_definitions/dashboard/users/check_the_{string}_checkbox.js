/* eslint-disable */
And("check the {string} checkbox", (checkboxName) => {
  cy.findByRole("checkbox", { name: checkboxName })
    .should("not.be.checked")
    .check();
});
