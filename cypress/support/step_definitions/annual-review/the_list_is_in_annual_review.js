Given("the list is in annual review", () => {
  cy.task("db", {
    operation: "list.findUnique",
    variables: {
      include: {
        country: true,
      },
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.task("db", {
      operation: "list.update",
      variables: {
        include: {
          country: true,
        },
        where: {
          reference: "SMOKE",
        },
        data: {
          jsonData: {
            ...list.jsonData,
            currentAnnualReview: {
              reference: "ANNUAL_REVIEW_REF",
            },
          },
          nextAnnualReviewStartDate: new Date(),
        },
      },
    });
  });
});
