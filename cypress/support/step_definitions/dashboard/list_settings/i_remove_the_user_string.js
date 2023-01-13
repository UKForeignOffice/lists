/* eslint-disable */
Given("I remove the user {string}", (email) => {
  cy.findAllByRole("term").contains(email).parent().find("button").click();
});
