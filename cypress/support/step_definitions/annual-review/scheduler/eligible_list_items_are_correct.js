Then("eligible list items are correct", async () => {
  await cy
    .task("db", {
      operation: "list.findFirst",
      variables: {
        where: {
          reference: "SMOKE",
        },
      },
    })
    .then((list) => {
      cy.expect(list.jsonData.updatedJsonData.eligibleListItems.length).to.equal(5);
    });
});
