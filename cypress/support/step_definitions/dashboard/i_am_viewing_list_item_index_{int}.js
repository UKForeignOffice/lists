Given("I am viewing list item index for reference:SMOKE", async () => {
  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    cy.log(result);
    cy.visit(`/dashboard/lists/${result.id}/items`);
  });
});
