import { subDays, startOfDay } from "date-fns";

When("the unpublished date is scheduled for tomorrow", async () => {
  const annualReviewDate = startOfDay(subDays(new Date(), 41))

  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then(() => {
    cy.task("db", {
      operation: "list.update",
      variables: {
        where: {
          reference: "SMOKE",
        },
        data: {
          nextAnnualReviewStartDate: annualReviewDate.toISOString(),
        }
      }
    });
  });
});
