/* eslint-disable */
Then("I should this order", (table) => {
  const rows = table.rows();
  rows.forEach(([contactName, rowPos]) => {
    cy.findAllByTestId("list-item-row")
      .eq(rowPos - 1)
      .contains(contactName);
  });
});
