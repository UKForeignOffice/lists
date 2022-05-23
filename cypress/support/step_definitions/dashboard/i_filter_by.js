When("I filter by", (dataTable) => {

  cy.get('html:root')
    .eq(0)
    .invoke('prop', 'outerHTML')
    .then(doc => {
      cy.task("log", `PAGE HTML for list items - filtering list items: ${doc}`);
    });

  const rows = `${dataTable.raw()}`.split(",");

  rows.forEach((row) => {
    cy.findByLabelText(row).click();
  });

  cy.findByText("Apply filters").click();
});
