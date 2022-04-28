When("I filter by", (dataTable) => {
  const rows = dataTable.raw();

  rows.forEach((row) => {
    cy.findByText(row);
  });

  cy.findByText("Apply filters").click();
});
