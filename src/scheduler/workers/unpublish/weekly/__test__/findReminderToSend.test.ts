import { findReminderToSend } from "../findReminderToSend";

const unpublished = {
  ONE_DAY: "2023-03-14T00:00:00.000Z",
  ONE_WEEK: "2023-03-08T00:00:00.000Z",
  UNPUBLISH: "2023-03-15T00:00:00.000Z",
  PROVIDER_TWO_WEEKS: "2023-03-01T00:00:00.000Z",
  PROVIDER_FIVE_WEEKS: "2023-02-08T00:00:00.000Z",
  PROVIDER_FOUR_WEEKS: "2023-02-15T00:00:00.000Z",
  PROVIDER_THREE_WEEKS: "2023-02-22T00:00:00.000Z",
};

const annualReview = {
  START: "2023-02-01T00:00:00.000Z",
  POST_ONE_DAY: "2023-01-31T00:00:00.000Z",
  POST_ONE_WEEK: "2023-01-25T00:00:00.000Z",
  POST_ONE_MONTH: "2023-01-04T00:00:00.000Z",
};

// const table = [
//   { days: 1, label: "start of week", expected: unpublished.ONE_WEEK },
//   { days: 3, label: "mid week", expected: unpublished.ONE_WEEK },
//   { days: 6, label: "before end of week", expected: unpublished.ONE_WEEK },
//   { days: 7, label: "end of week", expected: unpublished.ONE_WEEK },
//   { days: 8, label: "start of week", expected: unpublished.PROVIDER_TWO_WEEKS },
//   { days: 10, label: "mid week", expected: unpublished.PROVIDER_TWO_WEEKS },
//   { days: 13, label: "before end of week", expected: unpublished.PROVIDER_TWO_WEEKS },
//   { days: 14, label: "end of week", expected: unpublished.PROVIDER_TWO_WEEKS },
//   { days: 15, label: "start of week", expected: unpublished.PROVIDER_THREE_WEEKS },
//   { days: 17, label: "mid week", expected: unpublished.PROVIDER_THREE_WEEKS },
//   { days: 20, label: "before end of week", expected: unpublished.PROVIDER_THREE_WEEKS },
//   { days: 21, label: "end of week", expected: unpublished.PROVIDER_THREE_WEEKS },
//   { days: 22, label: "start of week", expected: unpublished.PROVIDER_FOUR_WEEKS },
//   { days: 24, label: "mid week", expected: unpublished.PROVIDER_FOUR_WEEKS },
//   { days: 27, label: "before end of week", expected: unpublished.PROVIDER_FOUR_WEEKS },
//   { days: 28, label: "end of week", expected: unpublished.PROVIDER_FOUR_WEEKS },
// ];
// test.each(table)("$days days after start ($label). Unsent event to find is >= $expected", ({ days, expected }) => {
//   const date = new Date(unpublished.UNPUBLISH);
//   const day = date.getDay();
//   date.setDate(day - days);
//
//   jest.useFakeTimers().setSystemTime(date);
//   console.log(date);
//   const reminder = findReminderToSend(list);
//
//   expect(reminder).toBe(expected);
// });
const start = new Date(annualReview.START).toISOString().split("T")[0];
const table = [
  { days: 1, currentWeek: 0, label: "start of week", expected: annualReview.START },
  { days: 3, currentWeek: 0, label: "mid week", expected: annualReview.START },
  { days: 6, currentWeek: 0, label: "before end of week", expected: annualReview.START },
  {
    days: 7,
    currentWeek: 1,
    label: "start of week",
    expected: unpublished.PROVIDER_FIVE_WEEKS,
    key: `unpublished.PROVIDER_FOUR_WEEKS`,
  },
  {
    days: 8,
    currentWeek: 1,
    label: "mid of week",
    expected: unpublished.PROVIDER_FOUR_WEEKS,
    key: `unpublished.PROVIDER_FOUR_WEEKS`,
  },
  {
    days: 10,
    currentWeek: 1,
    label: "mid week",
    expected: unpublished.PROVIDER_FOUR_WEEKS,
    key: `unpublished.PROVIDER_FOUR_WEEKS`,
  },
  {
    days: 13,
    currentWeek: 1,
    label: "before end of week",
    expected: unpublished.PROVIDER_FOUR_WEEKS,
    key: `unpublished.PROVIDER_FOUR_WEEKS`,
  },
  { days: 14, currentWeek: 2, label: "end of week", expected: unpublished.PROVIDER_FOUR_WEEKS },
  { days: 15, currentWeek: 2, label: "start of week", expected: unpublished.PROVIDER_THREE_WEEKS },
  { days: 17, currentWeek: 2, label: "mid week", expected: unpublished.PROVIDER_THREE_WEEKS },
  { days: 20, currentWeek: 2, label: "before end of week", expected: unpublished.PROVIDER_THREE_WEEKS },
  { days: 21, currentWeek: 3, label: "end of week", expected: unpublished.PROVIDER_THREE_WEEKS },
  { days: 22, currentWeek: 3, label: "start of week", expected: unpublished.PROVIDER_TWO_WEEKS },
  { days: 24, currentWeek: 3, label: "mid week", expected: unpublished.PROVIDER_TWO_WEEKS },
  { days: 27, currentWeek: 3, label: "before end of week", expected: unpublished.PROVIDER_TWO_WEEKS },
  { days: 28, currentWeek: 4, label: "end of week", expected: unpublished.PROVIDER_TWO_WEEKS },
];
test.each(table)(
  `$days days after ${start}. weeks since starting: $currentWeek. Checking for the absence of reminders sent at >= $key ($expected)`,
  ({ days, expected, currentWeek }) => {
    const date = new Date(annualReview.START);
    const day = date.getDate();
    date.setDate(day + days);
    jest.useFakeTimers().setSystemTime(date);

    const { reminderToFind, weeksUntilUnpublish } = findReminderToSend(list);
    expect(reminderToFind).toBe(expected);
  }
);

const keyDates = {
  unpublished,
  annualReview,
};

const currentAnnualReview = {
  keyDates,
  reference: "1ef30153-1234-4575-bb61-661da785cfd4",
  eligibleListItems: [
    408, 388, 413, 443, 381, 414, 389, 396, 501, 405, 406, 442, 373, 383, 382, 424, 419, 416, 435, 433, 438, 472, 446,
    471, 415, 412, 401, 395, 390, 378, 418, 386, 391, 392, 403, 410, 441, 399, 375, 421, 436, 434, 449, 450, 440, 387,
    404, 384,
  ],
};

const list = {
  jsonData: {
    currentAnnualReview,
  },
};
