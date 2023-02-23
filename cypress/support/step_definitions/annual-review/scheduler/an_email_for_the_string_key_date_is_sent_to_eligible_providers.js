Then("an email for the {string} key date is sent to eligible providers", function (keyDate) {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    const keyDateReminders = {
      START: "sendStartedProviderEmail",
    };
    cy.task("db", {
      operation: "audit.findFirst",
      variables: {
        where: {
          type: "listItem",
          auditEvent: "REMINDER",
          AND: [
            {
              jsonData: {
                path: ["reminderType"],
                equals: keyDateReminders[keyDate],
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
    }).then((audits, list) => {
      cy.expect(audits.length).to.be.gt(0);
      audits.forEach((audit) => {
        cy.expect(audit.jsonData.itemId).to.be.oneOf(list.jsonData.currentAnnualReview.eligibleListItems);
      });
    });
  });
});
