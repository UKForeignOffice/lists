Given("I am viewing list item index for reference:SMOKE", async () => {
  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    cy.task("log", `RETRIEVED list: ${result}.....`);
    cy.log(result);
    cy.visit(`http://localhost:3000/dashboard/lists/${result.id}/items`);
    cy.task("log", `VISITED list ${result.id}`);
    cy.get('html:root')
      .eq(0)
      .invoke('prop', 'outerHTML')
      .then(doc => {
        cy.task("log", `PAGE HTML for list items: ${doc}`);
      });

  });
});
