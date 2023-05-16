import { calculateSortOrder } from "../controllers.listsController";

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
    expect(calculateSortOrder({ admins: "desc" })).toEqual(expectedResult);
  });

  test("unknown values are stripped", () => {
    expect(calculateSortOrder({ admins: "abcef" })).toEqual([{ country: "asc" }, { type: "asc" }]);
    expect(calculateSortOrder({ country: "abcef" })).toEqual([{ country: "asc" }, { type: "asc" }]);
    expect(calculateSortOrder({ type: "abcef" })).toEqual([{ country: "asc" }, { type: "asc" }]);
  });
});
