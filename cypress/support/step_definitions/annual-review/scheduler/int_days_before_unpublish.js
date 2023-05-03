import { subDays, startOfDay } from "date-fns";

When("{int} days before unpublish", async (daysBeforeUnpublishing) => {
  const DAYS_FROM_START_UNTIL_UNPUBLISH = 42;
  const annualReviewDate = startOfDay(subDays(new Date(), DAYS_FROM_START_UNTIL_UNPUBLISH - daysBeforeUnpublishing));
  cy.task("db", {
    operation: "list.update",
    variables: {
      where: {
        reference: "SMOKE",
      },
      data: {
        nextAnnualReviewStartDate: annualReviewDate.toISOString(),
      },
    },
  });
});
