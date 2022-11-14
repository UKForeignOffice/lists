Then(
  "I should see these rows",
  (table) => {
    const rows = table.rows()
    rows.forEach(([term, definition]) => {
      const termElement = cy.findAllByText(term).eq(0);
      termElement.siblings().contains(definition)
    })
  }
);
