/* eslint-disable */
Then(
  "I should see {string} with a value of {string} on row number {string}",
  (rowLabel, rowValue, rowPosition) => {
    const rowPos = Number(rowPosition) - 1;
    const ROLE_FOR_DT_ELEM = "term";
    const ROLE_FOR_DD_ELEM = "definition";

    cy.findAllByRole(ROLE_FOR_DT_ELEM).eq(rowPos).contains(rowLabel);
    cy.findAllByRole(ROLE_FOR_DD_ELEM).eq(rowPos).contains(rowValue);
  }
);
