Then("I see the list items", (dataTable) => {
  const items = dataTable.raw();

  items.forEach((item) => {
    cy.findByText(item).click();
  });
});
