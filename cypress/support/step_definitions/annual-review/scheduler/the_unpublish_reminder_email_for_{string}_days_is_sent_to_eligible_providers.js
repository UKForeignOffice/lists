/* eslint-disable */
Then("the unpublish reminder email for {int} days is sent to eligible providers", async (noOfDays) => {
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
          annualReviewEmailType: "oneDayBeforeUnpublish",
          AND: [
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
      cy.expect(result.length).to.be.gt(0);
    });
  });
});
