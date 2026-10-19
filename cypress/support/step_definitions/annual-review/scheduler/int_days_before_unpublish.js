import { When } from "@badeball/cypress-cucumber-preprocessor";

import { utcDateByDays } from "./utcDateByDays";

When("{int} days before unpublish", (daysBeforeUnpublishing) => {
  const DAYS_FROM_START_UNTIL_UNPUBLISH = 42;
  const daysUntilUnpublish = DAYS_FROM_START_UNTIL_UNPUBLISH - daysBeforeUnpublishing;
  const annualReviewDate = utcDateByDays(new Date(), -daysUntilUnpublish);
  return cy.task("db", {
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
