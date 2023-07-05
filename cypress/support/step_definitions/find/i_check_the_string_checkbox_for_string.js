/* eslint-disable */
And("I {string} the {string} checkbox for {string}", (checkOrUncheck, checkButton, group) => {
  cy.findByRole("group", { name: group }).within(() => {
    cy.findByRole("checkbox", { name: checkButton })[checkOrUncheck]();
  });
});
