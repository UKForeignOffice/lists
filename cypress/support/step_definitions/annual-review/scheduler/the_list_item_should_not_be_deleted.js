Then("the list item should not be deleted", () => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        reference: "AUTO_DELETE"
      },
    },
  }).then((listItem) => {
    cy.expect(listItem).to.exist;
  });
});
