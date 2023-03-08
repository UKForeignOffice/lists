import { getMetaForList } from "../getMetaForList";

test.each`
  daysSinceStart | expectedWeeksUntilUnpublish | expectedWeeksSinceStart | expectedDaysUntilUnpublish
  ${1}           | ${5}                        | ${0}                    | ${41}
  ${2}           | ${5}                        | ${0}                    | ${40}
  ${5}           | ${5}                        | ${0}                    | ${37}
  ${7}           | ${5}                        | ${1}                    | ${35}
  ${11}          | ${4}                        | ${1}                    | ${31}
  ${14}          | ${4}                        | ${2}                    | ${28}
  ${15}          | ${3}                        | ${2}                    | ${27}
  ${21}          | ${3}                        | ${3}                    | ${21}
  ${22}          | ${2}                        | ${3}                    | ${20}
  ${28}          | ${2}                        | ${4}                    | ${14}
  ${35}          | ${1}                        | ${5}                    | ${7}
  ${42}          | ${0}                        | ${6}                    | ${0}
`(
  "getMetaForList returns $expectedWeeksUntilUnpublish weeks until unpublish when it has been $daysSinceStart days since starting",
  ({ daysSinceStart, expectedWeeksUntilUnpublish, expectedWeeksSinceStart, expectedDaysUntilUnpublish }) => {
    const date = new Date(startDate);
    const day = date.getDate();
    date.setDate(day + daysSinceStart);
    jest.useFakeTimers().setSystemTime(date);
    expect(getMetaForList(list)).toStrictEqual({
      reference,
      daysUntilUnpublish: expectedDaysUntilUnpublish,
      weeksUntilUnpublish: expectedWeeksUntilUnpublish,
      weeksSinceStart: expectedWeeksSinceStart,
      parsedUnpublishDate: "15 March 2023",
      countryName: "United Kingdom",
    });
  }
);

const reference = "SCR-4MB-13D";
const startDate = "2023-02-01T00:00:00.000Z";
const unpublishDate = "2023-03-15T00:00:00.000Z";

const list = {
  nextAnnualReviewStartDate: startDate,
  country: {
    name: "United Kingdom",
  },
  jsonData: {
    currentAnnualReview: {
      reference,
      keyDates: {
        annualReview: {
          START: startDate,
        },
        unpublished: {
          UNPUBLISH: unpublishDate,
        },
      },
    },
  },
};
