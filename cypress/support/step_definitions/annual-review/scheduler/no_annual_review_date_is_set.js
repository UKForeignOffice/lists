And("no annual review date is set", async () => {
  cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: {
        nextAnnualReviewStartDate: null,
      },
    },
  });
});
