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
      START: "started",
      POST_ONE_DAY: "oneDayBeforeStart",
      POST_ONE_WEEK: "oneWeekBeforeStart",
      POST_ONE_MONTH: "oneMonthBeforeStart",
    };
    cy.task("db", {
      operation: "audit.findFirst",
      variables: {
        where: {
          type: "list",
          auditEvent: "REMINDER",
          annualReviewEmailType: keyDateReminders[keyDate],
          jsonData: {
            path: ["annualReviewRef"],
            equals: list.jsonData.currentAnnualReview.reference,
          },
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
