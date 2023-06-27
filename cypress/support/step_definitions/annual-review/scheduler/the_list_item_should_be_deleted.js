Then("the list item should be deleted", () => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        status: "ANNUAL_REVIEW_OVERDUE",
        isAnnualReview: false,
        isPublished: false,
      },
    },
  }).then((listItem) => {
    cy.expect(listItem).to.be.null;
  });
});
