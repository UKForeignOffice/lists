/* eslint-disable */
Given("I am logged in as {string}", (email) => {
  cy.visit("/login");
  cy.get("#email-address").type(email);
});
