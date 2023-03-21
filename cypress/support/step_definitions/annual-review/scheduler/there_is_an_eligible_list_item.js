Then("there is an eligible list item", async () => {
    cy.task("db", {
      operation: "list.findFirst",
      variables: {
        where: {
          reference: "SMOKE",
        },
      },
    }).then((list) => {
      cy.expect(list.jsonData.currentAnnualReview.eligibleListItems.length).to.equal(1);
    });
  });
