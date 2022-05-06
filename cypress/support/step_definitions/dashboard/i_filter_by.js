When("I filter by", (dataTable) => {
  const rows = `${dataTable.raw()}`.split(",");

  rows.forEach((row) => {
    cy.findByLabelText(row).click();
  });

  cy.findByText("Apply filters").click();
});
