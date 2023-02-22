Then("an email for the {string} key date is sent to providers", function (keyDate) {
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
    }).then((audit) => {
      cy.expect(audit.id).to.exist;
    });
  });
});
