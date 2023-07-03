When("I visit the lawyers list for Eurasia", () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    cy.visit(`/dashboard/lists/${result.id}/items`);
  });
});
