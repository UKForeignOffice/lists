import { DateContext, getDateContexts, schedulerMilestoneDays } from "../helpers";

function testContext(actualUnpublishContext: DateContext[], expectedDateContexts: DateContext[], daysToAction: number) {
  const actualContext = actualUnpublishContext.find((context) => context.eventMilestone === daysToAction);
  const expectedContext = expectedDateContexts.find((context) => context.eventMilestone === daysToAction);
  return { expectedContext, actualContext };
}

describe("Date Contexts", () => {
  describe("annual review date contexts", () => {
    const expectedDateContexts: DateContext[] = [
      {
        eventDate: new Date(2022, 11, 5, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.post.ONE_MONTH,
      },
      {
        eventDate: new Date(2022, 11, 26, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.post.ONE_WEEK,
      },
      {
        eventDate: new Date(2023, 0, 1, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.post.ONE_DAY,
      },
      {
        eventDate: new Date(2023, 0, 2, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.both.START,
      },
    ];
    const dateContexts = getDateContexts(new Date("2022-12-05"));
    const actualAnnualReview = dateContexts.annualReview;

    test.each([
      schedulerMilestoneDays.post.ONE_MONTH,
      schedulerMilestoneDays.post.ONE_WEEK,
      schedulerMilestoneDays.post.ONE_DAY,
      schedulerMilestoneDays.post.ONE_DAY,
      schedulerMilestoneDays.both.START,
    ])("milestone contexts", (milestoneDays) => {
      const { expectedContext, actualContext } = testContext(actualAnnualReview, expectedDateContexts, milestoneDays);
      expect(actualContext?.eventMilestone).toBe(expectedContext?.eventMilestone);
      expect(actualContext?.eventDate.toString()).toBe(expectedContext?.eventDate.toString());
    });
  });

  describe("unpublished date contexts", () => {
    const expectedDateContexts: DateContext[] = [
      {
        eventDate: new Date(2022, 11, 12, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.provider.FIVE_WEEKS,
      },
      {
        eventDate: new Date(2022, 11, 19, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.provider.FOUR_WEEKS,
      },
      {
        eventDate: new Date(2022, 11, 26, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.provider.THREE_WEEKS,
      },
      {
        eventDate: new Date(2023, 0, 2, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.provider.TWO_WEEKS,
      },
      {
        eventDate: new Date(2023, 0, 9, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.provider.ONE_WEEK,
      },
      {
        eventDate: new Date(2023, 0, 15, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.provider.ONE_DAY,
      },
      {
        eventDate: new Date(2023, 0, 16, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.both.UNPUBLISH,
      },
    ];
    const dateContexts = getDateContexts(new Date("2022-12-05"));
    const actualUnpublishContext = dateContexts.unpublish;

    test.each([
      schedulerMilestoneDays.provider.FIVE_WEEKS,
      schedulerMilestoneDays.provider.FOUR_WEEKS,
      schedulerMilestoneDays.provider.THREE_WEEKS,
      schedulerMilestoneDays.provider.TWO_WEEKS,
      schedulerMilestoneDays.provider.ONE_WEEK,
      schedulerMilestoneDays.provider.ONE_DAY,
      schedulerMilestoneDays.both.START,
    ])("provider milestone contexts", (milestoneDays) => {
      const { expectedContext, actualContext } = testContext(
        actualUnpublishContext,
        expectedDateContexts,
        milestoneDays
      );
      expect(actualContext?.eventMilestone).toBe(expectedContext?.eventMilestone);
      expect(actualContext?.eventDate.toString()).toBe(expectedContext?.eventDate.toString());
    });
  });
});
