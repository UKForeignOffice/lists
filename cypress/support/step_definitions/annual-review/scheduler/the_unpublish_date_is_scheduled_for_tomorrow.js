import { subDays, startOfDay } from "date-fns";

When("{int} days before unpublish", async (daysBeforeUnpublish) => {
  const annualReviewDate = startOfDay(subDays(new Date(), daysBeforeUnpublish))

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
