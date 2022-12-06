/* eslint-disable */
Given("I click on the link from the confirmation email", () => {
  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    cy.task("db", {
      operation: "listItem.findFirst",
      variables: {
        where: {
          listId: result.id,
        },
      },
    }).then((resp) => {
      cy.visit(`/annual-review/confirm/${resp.reference}`);
    });
  });
});
