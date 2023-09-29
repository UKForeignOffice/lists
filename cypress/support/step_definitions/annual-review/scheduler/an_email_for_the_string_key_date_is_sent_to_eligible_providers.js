Then("an email for the {string} key date is sent to eligible providers", async function () {
  let list;
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    cy.task("db", {
      operation: "event.findMany",
      variables: {
        where: {
          type: "REMINDER",
          annualReviewEmailType: "started",
          AND: [
            {
              jsonData: {
                path: ["reference"],
                equals: result.jsonData.currentAnnualReview.reference,
              },
            },
          ],
        },
        orderBy: {
          time: "desc",
        },
      },
    }).then((result) => {
      cy.expect(result.length).to.be.gt(0);
    });
  });
});
