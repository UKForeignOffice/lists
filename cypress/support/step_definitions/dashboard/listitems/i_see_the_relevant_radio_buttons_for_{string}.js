Given("I am viewing the list item details for {string}", async (contactName) => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        jsonData: {
          path: ["contactName"],
          equals: contactName
        },
      },
    },
  }).then((result) => {
    cy.log("listItem.findFirst result:" + JSON.stringify(result));
    cy.visit(`http://localhost:3000/dashboard/lists/${result.listId}/items/${result.id}`, {failOnStatusCode: false});
  });
});
