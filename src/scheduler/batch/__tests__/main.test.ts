import { DateContext, getDateContexts, schedulerMilestoneDays, SchedulerDateContexts } from "../helpers";
import type { ListItem, List } from "../../../shared/types";

jest.mock("server/services/logger");

const annualReview: DateContext[] = [
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

const unpublish: DateContext[] = [
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
function testContext(actualUnpublishContext: DateContext[], expectedDateContexts: DateContext[], daysToAction: number) {
  const actualContext = actualUnpublishContext.find((context) => context.eventMilestone === daysToAction);
  const expectedContext = expectedDateContexts.find((context) => context.eventMilestone === daysToAction);
  return { expectedContext, actualContext };
}

describe("Date Contexts", () => {
  describe("annual review date contexts", () => {
    const dateContexts = getDateContexts(new Date("2022-12-05"));
    const actualAnnualReview = dateContexts.annualReview;

    test.each([
      schedulerMilestoneDays.post.ONE_MONTH,
      schedulerMilestoneDays.post.ONE_WEEK,
      schedulerMilestoneDays.post.ONE_DAY,
      schedulerMilestoneDays.both.START,
    ])("annual review date contexts for milestone days", (milestoneDays) => {
      const { expectedContext, actualContext } = testContext(actualAnnualReview, annualReview, milestoneDays);
      expect(actualContext?.eventMilestone).toBe(expectedContext?.eventMilestone);
      expect(actualContext?.eventDate.toString()).toBe(expectedContext?.eventDate.toString());
    });
  });

  describe("unpublished date contexts", () => {
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
    ])("unpublished date context for milestone days", (milestoneDays) => {
      const { expectedContext, actualContext } = testContext(actualUnpublishContext, unpublish, milestoneDays);
      expect(actualContext?.eventMilestone).toBe(expectedContext?.eventMilestone);
      expect(actualContext?.eventDate.toString()).toBe(expectedContext?.eventDate.toString());
    });
  });

  describe("update list items", () => {
    const listItem: ListItem = {
      id: 1,
      listId: 1,
      reference: "ref",
      createdAt: new Date(),
      updatedAt: new Date(),
      type: "lawyers",
      jsonData: {},
      addressId: 0,
      isApproved: false,
      isPublished: false,
      isBlocked: false,
      isAnnualReview: false,
      status: "NEW",
    };

    const list: List = {
      id: 1,
      reference: "ref",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastAnnualReviewStartDate: new Date(),
      nextAnnualReviewStartDate: new Date(),
      isAnnualReview: false,
      type: "lawyers",
      countryId: 1,
      jsonData: {
        validators: ["test@test.com"],
        publishers: ["test@test.com"],
        administrators: ["test@test.com"],
      },
    };

    const dateContexts: SchedulerDateContexts = {
      annualReview,
      unpublish,
    };

    // @todo FIX THIS BROKEN TEST
    test.todo("no list items found");
  });
});
