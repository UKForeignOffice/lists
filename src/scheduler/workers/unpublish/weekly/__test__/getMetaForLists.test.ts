import { getMetaForList } from "../getMetaForList";

test.each`
  daysSinceStart | expectedWeeks
  ${1}           | ${5}
  ${2}           | ${5}
  ${5}           | ${5}
  ${7}           | ${5}
  ${11}          | ${4}
  ${14}          | ${4}
  ${15}          | ${3}
  ${21}          | ${3}
  ${22}          | ${2}
  ${28}          | ${2}
  ${35}          | ${1}
  ${42}          | ${0}
`(
  "getMetaForList returns $expectedWeeks weeks until unpublish when it has been $daysSinceStart days since starting",
  ({ daysSinceStart, expectedWeeks }) => {
    const date = new Date(startDate);
    const day = date.getDate();
    date.setDate(day + daysSinceStart);
    jest.useFakeTimers().setSystemTime(date);
    expect(getMetaForList(list)).toStrictEqual({
      reference,
      weeksUntilUnpublish: expectedWeeks,
    });
  }
);

const reference = "SCR-4MB-13D";
const startDate = "2023-02-01T00:00:00.000Z";
const unpublishDate = "2023-03-15T00:00:00.000Z";

const list = {
  nextAnnualReviewStartDate: startDate,
  jsonData: {
    currentAnnualReview: {
      reference,
      keyDates: {
        annualReview: {
          START: startDate,
        },
        unpublish: {
          UNPUBLISHED: unpublishDate,
        },
      },
    },
  },
};
