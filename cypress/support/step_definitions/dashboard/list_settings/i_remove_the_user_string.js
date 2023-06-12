/* eslint-disable */
Given("I remove the user {string}", (email) => {
  cy.findByRole("button", { name: `Remove ${email}`, exact: false }).click();
});
