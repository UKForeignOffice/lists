import { calculateSortOrder, convertEntryToObject, sanitiseQuery, tableHeaders } from "../listsController.helpers";

describe("calculateSortOrder", () => {
  test("returns correct sort order when there are no query parameters", () => {
    const expectedResult = [{ country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder({})).toEqual(expectedResult);
  });

  test("ignores unaccepted query parameters", () => {
    const expectedResult = [{ country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder({ jsonData: "asc" })).toEqual(expectedResult);
  });

  test("returns correct sort order with desc sort direction", () => {
    const expectedResult = [{ admins: "desc" }, { country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder({ admins: "desc" })).toEqual(expectedResult);
  });

  test("returns correct sort order with asc sort direction", () => {
    const expectedResult = [{ admins: "asc" }, { country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder({ admins: "asc" })).toEqual(expectedResult);
  });

  test("unknown values are stripped", () => {
    expect(calculateSortOrder({ admins: "abcef" })).toEqual([{ country: "asc" }, { type: "asc" }]);
    expect(calculateSortOrder({ country: "abcef" })).toEqual([{ country: "asc" }, { type: "asc" }]);
    expect(calculateSortOrder({ type: "abcef" })).toEqual([{ country: "asc" }, { type: "asc" }]);
  });
});

test("sanitiseQuery strips invalid values and their keys", () => {
  expect(
    sanitiseQuery({
      admins: "eggs",
    }).value
  ).toEqual({});

  expect(
    sanitiseQuery({
      type: "asc",
      admin: "eggs",
    }).value
  ).toEqual({
    type: "asc",
  });
});

test("sanitiseQuery strips unknown keys", () => {
  expect(
    sanitiseQuery({
      jsonData: "asc",
    }).value
  ).toEqual({});
});

test("convertObjectToEntry returns SortOrderInput when a date key is passed with nulls treated as the earliest date", () => {
  expect(convertEntryToObject(["lastAnnualReviewStartDate", "asc"])).toEqual({
    lastAnnualReviewStartDate: {
      sort: "asc",
      nulls: "first",
    },
  });

  expect(convertEntryToObject(["lastAnnualReviewStartDate", "desc"])).toEqual({
    lastAnnualReviewStartDate: {
      sort: "desc",
      nulls: "last",
    },
  });

  expect(convertEntryToObject(["nextAnnualReviewStartDate", "asc"])).toEqual({
    nextAnnualReviewStartDate: {
      sort: "asc",
      nulls: "first",
    },
  });

  expect(convertEntryToObject(["nextAnnualReviewStartDate", "desc"])).toEqual({
    nextAnnualReviewStartDate: {
      sort: "desc",
      nulls: "last",
    },
  });

  const { notADateKey } = convertEntryToObject(["notADateKey", "asc"]);
  expect(notADateKey.sort).toBeFalsy();
  expect(notADateKey.nulls).toBeFalsy();
});

test("convertObjectToEntry returns SortOrder when passed a non-date entry", () => {
  expect(convertEntryToObject(["eggs", "asc"])).toEqual({ eggs: "asc" });
});

test("tableHeaders does not include jsonData or listId cells", () => {
  const headers = tableHeaders({});
  expect(headers.find((header) => header.name === "listId")).toBeFalsy();
  expect(headers.find((header) => header.name === "jsonData")).toBeFalsy();
});

describe("tableHeaders", () => {
  test("currentlySortedBy is none if not present in query params", () => {
    const headers = tableHeaders({});
    const adminCell = headers.find((header) => header.name === "admins");
    expect(adminCell.currentlySortedBy).toEqual("none");
  });

  test("currentlySortedBy matches query parameter", () => {
    const headers = tableHeaders({ admins: "asc", live: "desc" });
    const adminCell = headers.find((header) => header.name === "admins");
    expect(adminCell.currentlySortedBy).toEqual("asc");
    const liveCell = headers.find((header) => header.name === "live");
    expect(liveCell.currentlySortedBy).toEqual("desc");
  });
});
