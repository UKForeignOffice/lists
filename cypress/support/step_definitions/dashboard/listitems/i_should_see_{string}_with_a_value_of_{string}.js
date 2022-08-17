/* eslint-disable */
Then(
  "I should see {string} with a value of {string}",
  (dataName, dataValue) => {
    cy.screenshot();
    cy.findByText(dataName);
    cy.findByText(dataValue);
  }
);
