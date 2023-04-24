import { subDays, startOfDay, addDays, subYears } from "date-fns";

When("annual review date was {int} days ago", async (daysAfterAnnualReview) => {
  const annualReviewDate = startOfDay(subDays(new Date(), daysAfterAnnualReview))

  const INTERVALS_IN_DAYS = {
    post: {
      ONE_MONTH: 28,
      ONE_WEEK: 7,
      ONE_DAY: 1,
    },
    provider: {
      SIX_WEEKS: 42,
      FIVE_WEEKS: 35,
      FOUR_WEEKS: 28,
      THREE_WEEKS: 21,
      TWO_WEEKS: 14,
      ONE_WEEK: 7,
      ONE_DAY: 1,
    }
  };

  const keyDates = {
    annualReview: {
      POST_ONE_MONTH: subDays(annualReviewDate, INTERVALS_IN_DAYS.post.ONE_MONTH).toISOString(),
      POST_ONE_WEEK: subDays(annualReviewDate, INTERVALS_IN_DAYS.post.ONE_WEEK).toISOString(),
      POST_ONE_DAY: subDays(annualReviewDate, INTERVALS_IN_DAYS.post.ONE_DAY).toISOString(),
      START: annualReviewDate.toISOString(),
    },
    unpublished: {
      PROVIDER_FIVE_WEEKS: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.ONE_WEEK).toISOString(),
      PROVIDER_FOUR_WEEKS: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.TWO_WEEKS).toISOString(),
      PROVIDER_THREE_WEEKS: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.THREE_WEEKS).toISOString(),
      PROVIDER_TWO_WEEKS: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.FOUR_WEEKS).toISOString(),
      ONE_WEEK: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.FIVE_WEEKS).toISOString(),
      ONE_DAY: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.SIX_WEEKS - 1).toISOString(),
      UNPUBLISH: addDays(annualReviewDate, INTERVALS_IN_DAYS.provider.SIX_WEEKS).toISOString(),
    }
  }

  cy.task("db", {
    operation: "list.findFirst",
    variables: {
      where: {
        reference: "SMOKE",
      },
    },
  }).then((list) => {
    cy.task("db", {
      operation: "list.update",
      variables: {
        where: {
          reference: "SMOKE",
        },
        data: {
          nextAnnualReviewStartDate: annualReviewDate.toISOString(),
          lastAnnualReviewStartDate: subYears(annualReviewDate, 1).toISOString(),
          jsonData: {
            ...list.jsonData,
            currentAnnualReview: {
              ...list.jsonData.currentAnnualReview,
              keyDates,
              reference: "52c169da-8b01-4793-8ac4-205494b8c22f",
            }
          }
        }
      }
    });
  });
});
