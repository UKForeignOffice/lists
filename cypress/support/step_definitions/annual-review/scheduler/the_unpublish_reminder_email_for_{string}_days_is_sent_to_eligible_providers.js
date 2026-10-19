import { Then } from "@badeball/cypress-cucumber-preprocessor";

/* eslint-disable */
Then("the unpublish reminder email for {int} days is sent to eligible providers", (noOfDays) => {
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
          AND: [
            {
              jsonData: {
                path: ["notes"],
                equals: [`sent reminder for ${noOfDays} days until unpublish`],
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
      cy.expect(result.length).to.be.gt(0);
    });
  });
});
