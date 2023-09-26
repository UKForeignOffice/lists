import {
  composeKeyDatesForDate,
  DateContext,
  getCurrentAnnualReviewData,
  getDateContexts,
  schedulerMilestoneDays,
} from "../helpers";
import { startOfDay } from "date-fns";

function testContext(actualUnpublishContext: DateContext[], expectedDateContexts: DateContext[], daysToAction: number) {
  const actualContext = actualUnpublishContext.find((context) => context.eventMilestone === daysToAction);
  const expectedContext = expectedDateContexts.find((context) => context.eventMilestone === daysToAction);
  return { expectedContext, actualContext };
}

describe("Date Contexts", () => {
  describe("annual review date contexts", () => {
    const expectedDateContexts: DateContext[] = [
      {
        eventDate: new Date(2022, 10, 7, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.post.ONE_MONTH,
      },
      {
        eventDate: new Date(2022, 10, 28, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.post.ONE_WEEK,
      },
      {
        eventDate: new Date(2022, 11, 4, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.post.ONE_DAY,
      },
      {
        eventDate: new Date(2022, 11, 5, 0, 0, 0),
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
        eventMilestone: schedulerMilestoneDays.both.ONE_WEEK,
      },
      {
        eventDate: new Date(2023, 0, 15, 0, 0, 0),
        eventMilestone: schedulerMilestoneDays.both.ONE_DAY,
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
      schedulerMilestoneDays.both.ONE_WEEK,
      schedulerMilestoneDays.both.ONE_DAY,
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

describe("Today Date", () => {
  describe("today is GMT timezone", () => {
    jest.useFakeTimers().setSystemTime(new Date("01-Dec-2022 15:37:22.000"));
    const expectedDate = "2022-12-01T00:00:00.000Z";
    const actualDate = startOfDay(new Date());
    expect(actualDate.toISOString()).toBe(expectedDate);
  });
  describe("today is BST timezone after midnight", () => {
    jest.useFakeTimers().setSystemTime(new Date("05-May-2023 15:37:22.000"));
    const expectedDate = "2023-05-05T00:00:00.000Z";
    const actualDate = startOfDay(new Date());
    expect(actualDate.toISOString()).toBe(expectedDate);
  });
  describe("today is BST timezone after 11pm, before midnight", () => {
    jest.useFakeTimers().setSystemTime(new Date("05-May-2023 23:37:22.000"));
    const expectedDate = "2023-05-05T00:00:00.000Z";
    const actualDate = startOfDay(new Date());
    expect(actualDate.toISOString()).toBe(expectedDate);
  });
});

test("getCurrentAnnualReviewData returns the same dates as composeKeyDates", () => {
  const contexts = getDateContexts(new Date("2022-05-01T00:00:00.000Z"));
  const getCurrentAnnualReviewDataKeyDates = getCurrentAnnualReviewData([], contexts).keyDates;

  const composedKeyDates = composeKeyDatesForDate(new Date("2022-05-01T00:00:00.000Z"));
  expect(getCurrentAnnualReviewDataKeyDates).toEqual(composedKeyDates);
});

test("composeKeyDatesForDate is correct when today's date is 1st May 2022", () => {
  const keyDates = composeKeyDatesForDate(new Date("2022-05-01T00:00:00.000Z"));
  expect(keyDates).toEqual({
    annualReview: {
      POST_ONE_DAY: "2022-04-30T00:00:00.000Z",
      POST_ONE_MONTH: "2022-04-03T00:00:00.000Z",
      POST_ONE_WEEK: "2022-04-24T00:00:00.000Z",
      START: "2022-05-01T00:00:00.000Z",
    },
    unpublished: {
      ONE_DAY: "2022-06-11T00:00:00.000Z",
      ONE_WEEK: "2022-06-05T00:00:00.000Z",
      PROVIDER_FIVE_WEEKS: "2022-05-08T00:00:00.000Z",
      PROVIDER_FOUR_WEEKS: "2022-05-15T00:00:00.000Z",
      PROVIDER_THREE_WEEKS: "2022-05-22T00:00:00.000Z",
      PROVIDER_TWO_WEEKS: "2022-05-29T00:00:00.000Z",
      UNPUBLISH: "2022-06-12T00:00:00.000Z",
    },
  });
});
