import { getMetaForList } from "../getMetaForList";
import { subDays } from "date-fns";

test.each`
  daysBeforeUnpublish
  ${7}
  ${1}
  ${0}
  ${-1}
`(
  "getMetaForList returns $daysBeforeUnpublish days until unpublish when the current day is $daysBeforeUnpublish days before unpublish",
  ({ daysBeforeUnpublish }) => {
    let fakeToday = new Date(unpublishDate);
    fakeToday = subDays(fakeToday, daysBeforeUnpublish);
    jest.useFakeTimers().setSystemTime(fakeToday);
    expect(getMetaForList(list)).toStrictEqual({
      reference,
      daysUntilUnpublish: daysBeforeUnpublish,
      parsedUnpublishDate: "15 March 2023",
      countryName: "United Kingdom",
    });
  }
);

const testInLondonTimeZone = process.env.TZ === "Europe/London" ? test : test.skip;

testInLondonTimeZone("getMetaForList counts local calendar days across the spring DST change", () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-03-30T12:00:00.000Z"));
  const dstList = {
    ...list,
    jsonData: {
      currentAnnualReview: {
        reference,
        keyDates: {
          unpublished: {
            UNPUBLISH: "2024-04-01T00:00:00.000Z",
          },
        },
      },
    },
  };

  try {
    expect(getMetaForList(dstList)).toStrictEqual({
      reference,
      daysUntilUnpublish: 2,
      parsedUnpublishDate: "1 April 2024",
      countryName: "United Kingdom",
    });
  } finally {
    jest.useRealTimers();
  }
});

test("getMetaForList handles an unpublish date at the year boundary", () => {
  jest.useFakeTimers().setSystemTime(new Date("2023-12-31T12:00:00.000Z"));
  const newYearList = {
    ...list,
    jsonData: {
      currentAnnualReview: {
        reference,
        keyDates: {
          unpublished: {
            UNPUBLISH: "2024-01-01T00:00:00.000Z",
          },
        },
      },
    },
  };

  try {
    expect(getMetaForList(newYearList)).toStrictEqual({
      reference,
      daysUntilUnpublish: 1,
      parsedUnpublishDate: "1 January 2024",
      countryName: "United Kingdom",
    });
  } finally {
    jest.useRealTimers();
  }
});

const reference = "SCR-4MB-13D";
const unpublishDate = "2023-03-15T00:00:00.000Z";

const list = {
  country: {
    name: "United Kingdom",
  },
  jsonData: {
    currentAnnualReview: {
      reference,
      keyDates: {
        unpublished: {
          UNPUBLISH: unpublishDate,
        },
      },
    },
  },
};
