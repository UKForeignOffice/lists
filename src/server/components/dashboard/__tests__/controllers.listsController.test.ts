import { calculateSortOrder } from "../controllers.listsController";

describe("calculateSortOrder", () => {
  test("returns correct sort order when there are no query parameters", () => {
    const expectedResult = [{ country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder({})).toEqual(expectedResult);
  });

  test("returns correct sort order when admins query parameter is not provided", () => {
    const expectedResult = [{ country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder({ jsonData: "asc" })).toEqual(expectedResult);
  });

  test("returns correct sort order with desc sort direction", () => {
    const queryParamSortOrder: { admins: "desc" } = { admins: "desc" };

    const expectedResult = [{ admins: "desc" }, { country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder(queryParamSortOrder)).toEqual(expectedResult);
  });

  test("returns correct sort order with asc sort direction", () => {
    const queryParamSortOrder: { admins: "asc" } = { admins: "asc" };
    const expectedResult = [{ admins: "asc" }, { country: "asc" }, { type: "asc" }];
    expect(calculateSortOrder(queryParamSortOrder)).toEqual(expectedResult);
  });
});
