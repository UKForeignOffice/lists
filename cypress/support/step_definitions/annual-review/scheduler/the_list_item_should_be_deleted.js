Then("the list item should be deleted", () => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        reference: "AUTO_DELETE"
      },
    },
  }).then((listItem) => {
    cy.log(listItem, 'listItem');
    cy.expect(listItem).to.be.null;
  });
});
