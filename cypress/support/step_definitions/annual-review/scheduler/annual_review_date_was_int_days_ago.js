import { subDays, startOfDay } from "date-fns";

When("annual review date was {int} days ago", async (daysAfterAnnualReview) => {
  const annualReviewDate = startOfDay(subDays(new Date(), daysAfterAnnualReview))

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
