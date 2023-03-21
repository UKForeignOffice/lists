Then("there are {string} eligible list items", async (listItem) => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.expect(list.jsonData.currentAnnualReview.eligibleListItems.length).to.equal(Number(listItem));
  });
});
