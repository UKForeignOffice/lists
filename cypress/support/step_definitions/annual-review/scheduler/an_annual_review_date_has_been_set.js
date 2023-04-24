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
    const aMonthInTheFutureFromToday = new Date();
    aMonthInTheFutureFromToday.setDate(aMonthInTheFutureFromToday.getDate() + 29);
    cy.expect(list.nextAnnualReviewStartDate > aMonthInTheFutureFromToday);
  });
});
