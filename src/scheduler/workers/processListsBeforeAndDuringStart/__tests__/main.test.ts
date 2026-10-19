import { processList } from "../main";
import { sendAnnualReviewPostEmail } from "../govukNotify";
import type { List, ListItemWithHistory } from "shared/types";

jest.mock("../audit", () => ({
  findAuditEvents: jest.fn().mockResolvedValue({ result: [] }),
}));

jest.mock("../govukNotify", () => ({
  sendAnnualReviewPostEmail: jest.fn().mockResolvedValue({ result: true }),
  sendAnnualReviewProviderEmail: jest.fn().mockResolvedValue({ result: true }),
}));

jest.mock("shared/audit", () => ({
  recordListItemEvent: jest.fn(),
}));

test("processList rejects a reversed one-month reminder interval before sending email", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-04-15T00:00:00.000Z"));
  const list = {
    id: 1,
    jsonData: {
      currentAnnualReview: {
        reference: "annual-review",
        keyDates: {
          annualReview: {
            POST_ONE_MONTH: "2024-05-01T00:00:00.000Z",
            POST_ONE_WEEK: "2024-04-01T00:00:00.000Z",
            POST_ONE_DAY: "2024-03-25T00:00:00.000Z",
            START: "2024-03-24T00:00:00.000Z",
          },
        },
      },
    },
  };

  try {
    await expect(processList(list as List, [{} as ListItemWithHistory])).rejects.toThrow(
      new RangeError("Invalid interval")
    );
  } finally {
    jest.useRealTimers();
  }

  expect(sendAnnualReviewPostEmail).not.toHaveBeenCalled();
});

test("processList rejects a reversed one-week reminder interval before sending email", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-02-15T00:00:00.000Z"));
  const list = {
    id: 1,
    jsonData: {
      currentAnnualReview: {
        reference: "annual-review",
        keyDates: {
          annualReview: {
            POST_ONE_MONTH: "2024-03-01T00:00:00.000Z",
            POST_ONE_WEEK: "2024-03-10T00:00:00.000Z",
            POST_ONE_DAY: "2024-02-01T00:00:00.000Z",
            START: "2024-01-31T00:00:00.000Z",
          },
        },
      },
    },
  };

  try {
    await expect(processList(list as List, [{} as ListItemWithHistory])).rejects.toThrow(
      new RangeError("Invalid interval")
    );
  } finally {
    jest.useRealTimers();
  }

  expect(sendAnnualReviewPostEmail).not.toHaveBeenCalled();
});

test("processList sends a reminder when today is inside a valid annual review interval", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-04-15T00:00:00.000Z"));
  const list = {
    id: 1,
    type: "service",
    users: [{ email: "post@example.com" }],
    country: { name: "United Kingdom" },
    nextAnnualReviewStartDate: new Date("2024-04-30T00:00:00.000Z"),
    jsonData: {
      currentAnnualReview: {
        reference: "annual-review",
        keyDates: {
          annualReview: {
            POST_ONE_MONTH: "2024-03-20T00:00:00.000Z",
            POST_ONE_WEEK: "2024-04-20T00:00:00.000Z",
            POST_ONE_DAY: "2024-04-29T00:00:00.000Z",
            START: "2024-04-30T00:00:00.000Z",
          },
        },
      },
    },
  };

  try {
    await processList(list as List, [{} as ListItemWithHistory]);
  } finally {
    jest.useRealTimers();
  }

  expect(sendAnnualReviewPostEmail).toHaveBeenCalledWith(
    "POST_ONE_MONTH",
    "post@example.com",
    "service",
    "United Kingdom",
    expect.any(String)
  );
});
