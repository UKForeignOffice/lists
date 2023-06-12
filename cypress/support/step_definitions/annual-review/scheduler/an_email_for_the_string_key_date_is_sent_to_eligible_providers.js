Then("an email for the {string} key date is sent to eligible providers", async function () {
  let list;
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    list = result;
    cy.task("db", {
      operation: "audit.findMany",
      variables: {
        where: {
          type: "listItem",
          auditEvent: "REMINDER",
          AND: [
            {
              jsonData: {
                path: ["reminderType"],
                equals: "sendStartedProviderEmail",
              },
            },
            {
              jsonData: {
                path: ["annualReviewRef"],
                equals: list.jsonData.currentAnnualReview.reference,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    }).then((result) => {
      cy.log(result);
      cy.expect(result.length).to.be.gt(0);
      result.forEach((audit) => {
        cy.expect(audit.jsonData.itemId).to.be.oneOf(list.jsonData.currentAnnualReview.eligibleListItems);
      });
    });
  });
});
