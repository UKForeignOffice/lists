Then("the unpublish email is not sent to user with reference {string}", async (reference) => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  })
    .then((list) => {
      return cy.task("db", {
        operation: "audit.findFirst",
        variables: {
          where: {
            AND: [
              {
                jsonData: {
                  path: ["eventName"],
                  equals: "startAnnualReview",
                },
              },
              {
                jsonData: {
                  path: ["itemId"],
                  equals: list.id,
                },
              },
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    })
    .then((audit) => {
      cy.task("db", {
        operation: "event.findMany",
        variables: {
          where: {
            listItem: {
              reference,
            },
            type: "REMINDER",
            annualReviewEmailType: "unpublished",
            AND: [
              {
                jsonData: {
                  path: ["annualReviewRef"],
                  equals: audit.jsonData.currentAnnualReview.reference,
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
