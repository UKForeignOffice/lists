/* eslint-disable */
Then("I should see nothing assiged to {string}", (email) => {
  cy.findByRole("rowheader", { name: email })
    .parent()
    .within(() => {
      cy.findByRole("cell", { name: "" }).should("be.empty");
    });
});
