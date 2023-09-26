Then("the unpublish reminder email is not sent", async () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.task("db", {
      operation: "audit.findFirst",
      variables: {
        where: {
          type: "list",
          auditEvent: "ANNUAL_REVIEW",
          jsonData: {
            path: ["itemId"],
            equals: list.id,
          },
        },
      },
    }).then((audit) => {
      cy.task("db", {
        operation: "event.findMany",
        variables: {
          where: {
            type: "REMINDER",
            annualReviewEmailType: "oneDayBeforeUnpublish",
            AND: [
              {
                jsonData: {
                  path: ["reference"],
                  equals: audit.jsonData.annualReviewRef,
                },
              },
            ],
          },
        },
      }).then((result) => {
        cy.expect(result.length).equals(0);
      });
    });
  });
});
