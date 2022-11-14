/* eslint-disable */
Then(
  "I should this order",
  (table) => {
    const rows = table.rows();
    rows.forEach(([contactName, rowPos]) => {
      cy.findAllByRole("listitem").eq(rowPos - 1).contains(contactName);
    })

  }
);
