/* eslint-disable */
Then(
  "I should see {string} at position {string}",
  (contactName, rowPosition) => {
    const rowPos = Number(rowPosition) - 1;
    const ROLE_FOR_LI_ELEM = "listitem";

    cy.findAllByRole(ROLE_FOR_LI_ELEM).eq(rowPos).contains(contactName);
  }
);
