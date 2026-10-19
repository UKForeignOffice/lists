import { getMetaForList } from "../getMetaForList";

test.each`
  daysSinceStart | expectedWeeksUntilUnpublish | expectedWeeksSinceStart
  ${1}           | ${5}                        | ${0}
  ${2}           | ${5}                        | ${0}
  ${5}           | ${5}                        | ${0}
  ${7}           | ${5}                        | ${1}
  ${11}          | ${4}                        | ${1}
  ${14}          | ${4}                        | ${2}
  ${15}          | ${3}                        | ${2}
  ${21}          | ${3}                        | ${3}
  ${22}          | ${2}                        | ${3}
  ${28}          | ${2}                        | ${4}
  ${35}          | ${1}                        | ${5}
  ${42}          | ${0}                        | ${6}
`(
  "getMetaForList returns $expectedWeeksUntilUnpublish weeks until unpublish when it has been $daysSinceStart days since starting",
  ({ daysSinceStart, expectedWeeksUntilUnpublish, expectedWeeksSinceStart }) => {
    const date = new Date(startDate);
    const day = date.getDate();
    date.setDate(day + daysSinceStart);
    jest.useFakeTimers().setSystemTime(date);
    expect(getMetaForList(list)).toStrictEqual({
      reference,
      weeksUntilUnpublish: expectedWeeksUntilUnpublish,
      weeksSinceStart: expectedWeeksSinceStart,
      parsedUnpublishDate: "15 March 2023",
      countryName: "United Kingdom",
    });
  }
);

const testInLondonTimeZone = process.env.TZ === "Europe/London" ? test : test.skip;

testInLondonTimeZone("getMetaForList counts full local weeks across the spring DST change", () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-04-01T12:00:00.000Z"));
  const dstList = {
    ...list,
    jsonData: {
      currentAnnualReview: {
        ...list.jsonData.currentAnnualReview,
        keyDates: {
          annualReview: {
            START: "2024-03-25T00:00:00.000Z",
          },
          unpublished: {
            UNPUBLISH: "2024-04-29T00:00:00.000Z",
          },
        },
      },
    },
  };

  try {
    expect(getMetaForList(dstList)).toStrictEqual({
      reference,
      weeksUntilUnpublish: 4,
      weeksSinceStart: 1,
      parsedUnpublishDate: "29 April 2024",
      countryName: "United Kingdom",
    });
  } finally {
    jest.useRealTimers();
  }
});

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
