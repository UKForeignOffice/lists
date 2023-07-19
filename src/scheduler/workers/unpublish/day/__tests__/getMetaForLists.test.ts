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
