Then("the list item should be deleted", () => {
  cy.task("db", {
    operation: "listItem.findFirst",
    variables: {
      where: {
        reference: "AUTO_DELETE"
      },
    },
  }).then((listItem) => {
    cy.expect(listItem).to.be.null;

    cy.task("db", {
      operation: "audit.findMany",
      variables: {
        where: {
          auditEvent: "DELETED"
        },
        orderBy: { id: 'desc' }
      },
    }).then((auditEvents) => {
      cy.log(auditEvents)
      const { notes } = auditEvents[0].jsonData;
      const expectedValue = ["automated", "deleted due to non-response to annual review for over a year"];

      cy.expect(notes).to.eql(expectedValue);
    });
  });
});
