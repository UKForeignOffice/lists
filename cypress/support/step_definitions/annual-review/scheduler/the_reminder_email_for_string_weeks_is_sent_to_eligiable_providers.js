/* eslint-disable */
const TOTAL_NO_UNPUBLISH_WEEKS = 5;
Then("the reminder email for {string} weeks is sent to eligible providers", async (noOfWeeks) => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.task("db", {
      operation: "event.findMany",
      variables: {
        where: {
          type: "REMINDER",
          annualReviewEmailType: "weeklyUnpublish",
          AND: [
            {
              jsonData: {
                path: ["notes"],
                equals: [
                  `sent reminder for week ${noOfWeeks}. (${TOTAL_NO_UNPUBLISH_WEEKS - noOfWeeks} until unpublish date)`,
                ],
              },
            },
            {
              jsonData: {
                path: ["reference"],
                equals: list.jsonData.currentAnnualReview.reference,
              },
            },
          ],
        },
      },
    }).then((result) => {
      cy.wrap(result.length).as("emailsSent");
      cy.expect(result.length).to.be.gt(0);
    });
  });
});

Then("the weeklyReminder emails were not re-sent", async () => {
  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.task("db", {
      operation: "event.findMany",
      variables: {
        where: {
          type: "REMINDER",
          annualReviewEmailType: "weeklyUnpublish",
          AND: [
            {
              jsonData: {
                path: ["reference"],
                equals: list.jsonData.currentAnnualReview.reference,
              },
            },
          ],
        },
      },
    }).then((result) => {
      cy.get("@emailsSent").then(($emailsSent) => {
        cy.expect($emailsSent).to.be.equal(result.length);
      });
    });
  });
});
