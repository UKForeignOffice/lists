/* eslint-disable */
And("I check the {string} checkbox for {string}", (checkButton, group) => {
  cy.findByRole("group", { name: group }).within(() => {
    cy.findByRole("checkbox", { name: checkButton }).check();
  });
});
