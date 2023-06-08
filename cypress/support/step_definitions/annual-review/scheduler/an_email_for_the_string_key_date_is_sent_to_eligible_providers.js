Then("an email for the {string} key date is sent to eligible providers", async function (keyDate) {
  let list, audits;
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((result) => {
    list = result;
    const keyDateReminders = {
      START: "sendStartedProviderEmail",
    };
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
    }).then((result) => {
      audits = result;
      cy.log(audits);
      cy.expect(audits.length).to.be.gt(0);
      audits.forEach((audit) => {
        cy.expect(audit.jsonData.itemId).to.be.oneOf(list.jsonData.currentAnnualReview.eligibleListItems);
      });
    });
  });
});
