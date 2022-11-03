/* eslint-disable */
And("I check the {string} checkbox", (checkButton) => {
  cy.findByRole("checkbox", { name: checkButton }).check();
});
