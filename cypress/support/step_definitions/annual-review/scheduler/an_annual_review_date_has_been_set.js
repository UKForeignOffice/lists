Then("an annual review date has been set", async () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.expect(list.nextAnnualReviewStartDate).not.to.equal(null);
  });
});
