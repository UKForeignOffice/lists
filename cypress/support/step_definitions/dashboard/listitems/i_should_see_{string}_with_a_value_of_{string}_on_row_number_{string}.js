Then(
  "I should see these rows",
  (table) => {
    const rows = table.rows()
    rows.forEach(([term, definition], rowPos) => {
      cy.findAllByRole("term").eq(rowPos).contains(term);
      cy.findAllByRole("definition").eq(rowPos).contains(definition);
    })
  }
);
