Then("the unpublish reminder email is not sent to user with reference {string}", function (reference) {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  })
    .then((list) => {
      cy.task("db", {
        operation: "event.findMany",
        variables: {
          where: {
            listItem: {
              reference,
            },
            type: "REMINDER",
            AND: [
              {
                jsonData: {
                  path: ["notes"],
                  array_contains: ["sent reminder for 1 days until unpublish"],
                },
              },
              {
                jsonData: {
                  path: ["reference"],
                  equals: list.jsonData.currentAnnualReview.reference,
                },
              },
            ],
          },
        },
      });
    })
    .then((result) => {
      cy.expect(result.length).equals(0);
    });
});
