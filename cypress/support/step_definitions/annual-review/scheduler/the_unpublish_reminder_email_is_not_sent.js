Then("the unpublish reminder email is not sent", async () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((audit) => {
    cy.task("db", {
      operation: "event.findMany",
      variables: {
        where: {
          type: "REMINDER",
          annualReviewEmailType: "oneDayBeforeUnpublish",
          jsonData: {
            path: ["reference"],
            equals: audit.jsonData.currentAnnualReview.reference,
          },
        },
      },
    }).then((result) => {
      cy.expect(result.length).equals(0);
    });
  });
});
