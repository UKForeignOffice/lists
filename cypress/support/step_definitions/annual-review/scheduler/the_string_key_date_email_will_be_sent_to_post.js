Then("the {string} key date email is sent to post", function (keyDate) {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    const keyDateReminders = {
      START: "sendStartedPostEmail",
      POST_ONE_DAY: "sendOneDayPostEmail",
      POST_ONE_WEEK: "sendOneWeekPostEmail",
      POST_ONE_MONTH: "sendOneMonthPostEmail",
    };
    cy.task("db", {
      operation: "audit.findFirst",
      variables: {
        where: {
          type: "list",
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
      cy.log(audit);
      cy.expect(audit.id).to.exist;
    });
  });
});
