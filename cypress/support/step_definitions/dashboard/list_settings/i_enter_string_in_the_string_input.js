/* eslint-disable */
And("I enter {string} in the {string} input", (value, name) => {
  cy.findByTestId(name).type(value);
});
