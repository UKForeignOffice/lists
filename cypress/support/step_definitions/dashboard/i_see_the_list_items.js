Then("I see the list items", (dataTable) => {
  const items = dataTable.raw()[0];
  if (Array.isArray(items)) {
    for (const item of items) {
      cy.findByText(item, { exact: false });
    }
  }
});
