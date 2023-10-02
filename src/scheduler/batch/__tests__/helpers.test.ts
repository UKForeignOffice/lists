import { composeKeyDatesForDate } from "../helpers";
import { startOfDay } from "date-fns";

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
