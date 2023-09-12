Given("I am viewing list item index for reference:{string}", (reference) => {
  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference,
      },
    },
  }).then((result) => {
    cy.visit(`/dashboard/lists/${result.id}/items`);
  });
});
