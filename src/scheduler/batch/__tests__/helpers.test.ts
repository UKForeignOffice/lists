import {
  DateContext,
  getDateContexts,
  schedulerMilestoneDays
} from "../helpers";

function testContext(actualUnpublishContext: DateContext[], expectedDateContexts: DateContext[], daysToAction: number) {
  const actualContext = actualUnpublishContext.find(
    (context) => context.eventMilestone === daysToAction
  );
  const expectedContext = expectedDateContexts.find(
    (context) => context.eventMilestone === daysToAction
  );
  expect(actualContext?.eventMilestone).toBe(expectedContext?.eventMilestone);
  expect(actualContext?.eventDate.toString()).toBe(expectedContext?.eventDate.toString());
}

describe("Date Contexts", () => {
  describe("annual review date contexts", () => {
    const expectedDateContexts: DateContext[] = [
      {
        eventDate: new Date(
          Date.UTC(2022, 11, 5, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.post.ONE_MONTH,
      },
      {
        eventDate: new Date(
          Date.UTC(2022, 11, 26, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.post.ONE_WEEK,
      },
      {
        eventDate: new Date(
          Date.UTC(2023, 0, 1, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.post.ONE_DAY,
      },
      {
        eventDate: new Date(
          Date.UTC(2023, 0, 2, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.both.START,
      },
    ];
    const dateContexts = getDateContexts("05-Dec-2022");
    const actualAnnualReview = dateContexts.annualReview;

    test("one month", () => {
      testContext(actualAnnualReview, expectedDateContexts, schedulerMilestoneDays.post.ONE_MONTH);
    });

    test("one week", () => {
      testContext(actualAnnualReview, expectedDateContexts, schedulerMilestoneDays.post.ONE_WEEK);
    });

    test("one day", () => {
      testContext(actualAnnualReview, expectedDateContexts, schedulerMilestoneDays.post.ONE_DAY);
    });

    test("start", () => {
      testContext(actualAnnualReview, expectedDateContexts, schedulerMilestoneDays.both.START);
    });
  });

  describe("unpublished date contexts", () => {
    const expectedDateContexts: DateContext[] = [
      {
        eventDate: new Date(
          Date.UTC(2022, 11, 12, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.provider.FIVE_WEEKS,
      },
      {
        eventDate: new Date(
          Date.UTC(2022, 11, 19, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.provider.FOUR_WEEKS,
      },
      {
        eventDate: new Date(
          Date.UTC(2022, 11, 26, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.provider.THREE_WEEKS,
      },
      {
        eventDate: new Date(
          Date.UTC(2023, 0, 2, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.provider.TWO_WEEKS,
      },
      {
        eventDate: new Date(
          Date.UTC(2023, 0, 9, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.provider.ONE_WEEK,
      },
      {
        eventDate: new Date(
          Date.UTC(2023, 0, 15, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.provider.ONE_DAY,
      },
      {
        eventDate: new Date(
          Date.UTC(2023, 0, 16, 0, 0, 0)
        ),
        eventMilestone: schedulerMilestoneDays.both.UNPUBLISH,
      },
    ];
    const dateContexts = getDateContexts("05-Dec-2022");
    const actualUnpublishContext = dateContexts.unpublish;

    test("five weeks", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.provider.FIVE_WEEKS);
    });

    test("four weeks", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.provider.FOUR_WEEKS);
    });

    test("three weeks", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.provider.THREE_WEEKS);
    });

    test("two weeks", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.provider.TWO_WEEKS);
    });

    test("one week", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.provider.ONE_WEEK);
    });

    test("one day", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.provider.ONE_DAY);
    });

    test("start", () => {
      testContext(actualUnpublishContext, expectedDateContexts, schedulerMilestoneDays.both.START);
    });
  });
});
