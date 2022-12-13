/* eslint-disable */
And("I should see {string} as part of the date", (string) => {
    cy.findByTestId("annual-review-date").contains(string);
  });
