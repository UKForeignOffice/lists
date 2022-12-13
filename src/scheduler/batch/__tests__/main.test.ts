import {
  DateContext,
  getDateContexts,
  schedulerMilestoneDays, SchedulerDateContexts
} from "../helpers";
import * as listItem from "../../../server/models/listItem";
import { List, ListItem } from "../../../server/models/types";
import { populateCurrentAnnualReview } from "../main";
import { logger } from "server/services/logger";

jest.mock("server/services/logger");

const annualReview: DateContext[] = [
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

const unpublish: DateContext[] = [
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
    const dateContexts = getDateContexts("05-Dec-2022");
    const actualAnnualReview = dateContexts.annualReview;

    test("one month", () => {
      testContext(actualAnnualReview, annualReview, schedulerMilestoneDays.post.ONE_MONTH);
    });

    test("one week", () => {
      testContext(actualAnnualReview, annualReview, schedulerMilestoneDays.post.ONE_WEEK);
    });

    test("one day", () => {
      testContext(actualAnnualReview, annualReview, schedulerMilestoneDays.post.ONE_DAY);
    });

    test("start", () => {
      testContext(actualAnnualReview, annualReview, schedulerMilestoneDays.both.START);
    });
  });

  describe("unpublished date contexts", () => {
    const dateContexts = getDateContexts("05-Dec-2022");
    const actualUnpublishContext = dateContexts.unpublish;

    test("five weeks", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.provider.FIVE_WEEKS);
    });

    test("four weeks", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.provider.FOUR_WEEKS);
    });

    test("three weeks", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.provider.THREE_WEEKS);
    });

    test("two weeks", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.provider.TWO_WEEKS);
    });

    test("one week", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.provider.ONE_WEEK);
    });

    test("one day", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.provider.ONE_DAY);
    });

    test("start", () => {
      testContext(actualUnpublishContext, unpublish, schedulerMilestoneDays.both.START);
    });
  });

  function spyFindListItemsForLists(listItemRecord: ListItem, shouldReject?: boolean): any {
    const spy = jest.spyOn(listItem, "findListItemsForLists");

    if (shouldReject === true) {
      spy.mockRejectedValue({ error: new Error("error"), });
    } else {
      spy.mockResolvedValue({ result: [listItemRecord] });
    }

    return spy;
  }

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
      nextAnnualReviewStartDate: new Date(),
      lastAnnualReviewStartDate: null,
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
    }

    // @todo FIX THIS BROKEN TEST
    test("no list items found", () => {
      spyFindListItemsForLists(listItem,false);
      populateCurrentAnnualReview([list], dateContexts)

      expect(logger.error).toHaveBeenCalledWith(`Unable to retrieve List Items for Lists ${list.id}: error`);
    });
  });
});
