And("no annual review date is set", async () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.expect(list.nextAnnualReviewStartDate).to.equal(null);
  });
});
