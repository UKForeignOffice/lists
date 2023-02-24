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
  /**
   *     { days: 1, currentWeek: 0, label: "start of week", scheduledDate: weeklyReminders[0] },
   *     { days: 3, currentWeek: 0, label: "mid week", scheduledDate: weeklyReminders[0] },
   *     { days: 6, currentWeek: 0, label: "before end of week", scheduledDate: weeklyReminders[0] },
   */
  const table = [
    { days: 7, currentWeek: 1, label: "start of week", scheduledDate: weeklyReminders[1] },
    { days: 8, currentWeek: 1, label: "mid week", scheduledDate: weeklyReminders[1] },
    { days: 10, currentWeek: 1, label: "mid week", scheduledDate: weeklyReminders[1] },
    { days: 13, currentWeek: 1, label: "before end of week", scheduledDate: weeklyReminders[1] },
    { days: 14, currentWeek: 2, label: "start of week", scheduledDate: weeklyReminders[2] },
    { days: 15, currentWeek: 2, label: "mid week", scheduledDate: weeklyReminders[2] },
    { days: 17, currentWeek: 2, label: "mid week", scheduledDate: weeklyReminders[2] },
    { days: 20, currentWeek: 2, label: "before end of week", scheduledDate: weeklyReminders[2] },
    { days: 21, currentWeek: 3, label: "start of week", scheduledDate: weeklyReminders[3] },
    { days: 22, currentWeek: 3, label: "mid", scheduledDate: weeklyReminders[3] },
    { days: 24, currentWeek: 3, label: "mid week", scheduledDate: weeklyReminders[3] },
    { days: 27, currentWeek: 3, label: "before end of week", scheduledDate: weeklyReminders[3] },
    { days: 28, currentWeek: 4, label: "start of week", scheduledDate: weeklyReminders[4] },
  ];
  test.each(table)(
    `$days days after start date.
    Checking for the absence of reminders scheduled for >= $scheduledDate (found on weeklyReminders[$currentWeek])`,
    ({ days, scheduledDate }) => {
      const date = new Date(annualReview.START);
      const day = date.getDate();
      date.setDate(day + days);
      jest.useFakeTimers().setSystemTime(date);

      const { reminderToFind, weeksUntilUnpublish } = findReminderToSend(list);
      expect(reminderToFind).toBe(scheduledDate);
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
