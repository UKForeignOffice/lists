import { getEmailTypeForToday } from "../getEmailTypeForToday";
beforeAll(() => {
  jest.useFakeTimers("modern");
});
afterAll(() => {
  jest.useRealTimers();
});

const keyDates = {
  annualReview: {
    START: "2023-07-22T00:00:00.000Z",
    POST_ONE_DAY: "2023-07-21T00:00:00.000Z",
    POST_ONE_WEEK: "2023-07-15T00:00:00.000Z",
    POST_ONE_MONTH: "2023-06-24T00:00:00.000Z",
  },
};

test.each`
  date                          | expected
  ${"2023-06-23T00:00:00.000Z"} | ${undefined}
  ${"2023-06-24T00:00:00.000Z"} | ${"oneMonthBeforeStart"}
  ${"2023-06-25T00:00:00.000Z"} | ${"oneMonthBeforeStart"}
  ${"2023-07-13T00:00:00.000Z"} | ${"oneMonthBeforeStart"}
  ${"2023-07-14T00:00:00.000Z"} | ${"oneMonthBeforeStart"}
  ${"2023-07-14T23:00:00.000Z"} | ${"oneMonthBeforeStart"}
  ${"2023-07-15T00:00:00.000Z"} | ${"oneWeekBeforeStart"}
  ${"2023-07-21T00:00:00.000Z"} | ${"oneDayBeforeStart"}
  ${"2023-07-22T00:00:00.000Z"} | ${"started"}
  ${"2023-07-23T00:00:00.000Z"} | ${"started"}
`("returns $expected if today is $date", ({ date, expected }) => {
  jest.setSystemTime(new Date(date));
  expect(getEmailTypeForToday(keyDates)).toBe(expected);
});
