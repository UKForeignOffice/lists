import { findReminderToSend } from "../findReminderToSend";

const weeklyReminders = {
  1: "2023-02-08T00:00:00.000Z",
  2: "2023-02-15T00:00:00.000Z",
  3: "2023-02-22T00:00:00.000Z",
  4: "2023-03-01T00:00:00.000Z",
  5: "2023-03-08T00:00:00.000Z",
};

const annualReview = {
  START: "2023-02-01T00:00:00.000Z",
  POST_ONE_DAY: "2023-01-31T00:00:00.000Z",
  POST_ONE_WEEK: "2023-01-25T00:00:00.000Z",
  POST_ONE_MONTH: "2023-01-04T00:00:00.000Z",
};

const start = new Date(annualReview.START).toISOString().split("T")[0];
describe(`findReminderToSend when start date is ${start}`, () => {
  test.each`
    days  | currentWeek | scheduledDate         | label
    ${7}  | ${1}        | ${weeklyReminders[1]} | ${"start of week"}
    ${8}  | ${1}        | ${weeklyReminders[1]} | ${"mid week"}
    ${10} | ${1}        | ${weeklyReminders[1]} | ${"mid week"}
    ${13} | ${1}        | ${weeklyReminders[1]} | ${"end of week"}
    ${14} | ${2}        | ${weeklyReminders[2]} | ${"start of week"}
    ${15} | ${2}        | ${weeklyReminders[2]} | ${"mid week"}
    ${17} | ${2}        | ${weeklyReminders[2]} | ${"mid week"}
    ${20} | ${2}        | ${weeklyReminders[2]} | ${"end of week"}
    ${21} | ${3}        | ${weeklyReminders[3]} | ${"start of week"}
    ${22} | ${3}        | ${weeklyReminders[3]} | ${"mid week"}
    ${24} | ${3}        | ${weeklyReminders[3]} | ${"mid week"}
    ${27} | ${3}        | ${weeklyReminders[3]} | ${"end of week"}
    ${28} | ${4}        | ${weeklyReminders[4]} | ${"start start week"}
  `(
    "$days days after start date ($label $currentWeek). Checking for the absence of reminders scheduled for >= $scheduledDate",
    ({ days, scheduledDate, currentWeek }) => {
      const date = new Date(annualReview.START);
      const day = date.getDate();
      date.setDate(day + days);
      jest.useFakeTimers().setSystemTime(date);

      const { reminderToFind, weeksSinceStartDate } = findReminderToSend(list);
      expect(reminderToFind).toBe(scheduledDate);
      expect(weeksSinceStartDate).toBe(currentWeek);
    }
  );
});

const keyDates = {
  unpublished: {
    UNPUBLISH: "2023-03-15T00:00:00.000Z",
  },
  weeklyReminders,
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
