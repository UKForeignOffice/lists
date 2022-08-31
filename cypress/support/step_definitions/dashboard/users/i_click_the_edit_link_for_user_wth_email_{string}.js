/* eslint-disable */
When("I click the edit link for user with email {string}", (email) => {
  cy.visit(`/dashboard/users/${email}`);
});
