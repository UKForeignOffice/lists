/* eslint-disable */
const TOTAL_NO_UNPUBLISH_WEEKS = 5
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
      operation: "event.findMany",
      variables: {
        where: {
          type: "REMINDER",
          AND: [
            {
              jsonData: {
                path: ["notes"],
                array_contains: ['sent reminder for'],
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
    }).then((result) => {
      cy.expect(result.length).equals(0);
    })
  })
});
