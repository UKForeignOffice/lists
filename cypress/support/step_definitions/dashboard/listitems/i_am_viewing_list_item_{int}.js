Given("I am viewing list item index for reference:SMOKE", async () => {
  cy.task("db", {
    operation: "listitem.findUnique",
    variables: {
      where: {
        jsonData: {
          path: ["contactName"],
          equals: "Winston"
        },
      },
    },
  }).then((result) => {
    cy.log(result);
    cy.visit(`http://localhost:3000/dashboard/lists/${result.listItemId}/items/${result.id}`);
  });
});
