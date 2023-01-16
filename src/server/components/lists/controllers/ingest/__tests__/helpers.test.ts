import { arrayHasChanges, getObjectDiff } from "../helpers";

describe("arrayHasChanges", () => {
  it("returns false for arrays with the same value in the same order", () => {
    expect(arrayHasChanges([1], [1])).toBeFalsy();
    expect(arrayHasChanges(["a"], ["a"])).toBeFalsy();
    expect(arrayHasChanges([], [])).toBeFalsy();
    expect(arrayHasChanges(["fried", "scrambled", "poached"], ["fried", "scrambled", "poached"])).toBeFalsy();
    expect(arrayHasChanges([true, true, false], [true, true, false])).toBeFalsy();
  });

  it("returns false for arrays with the same value but different order", () => {
    expect(arrayHasChanges(["a", "b", "c"], ["b", "c", "a"])).toBeFalsy();
    expect(arrayHasChanges([1, 2, 3], [3, 1, 2])).toBeFalsy();
    expect(arrayHasChanges([true, true, false], [true, false, true])).toBeFalsy();
  });

  it("returns true for arrays with different values", () => {
    expect(arrayHasChanges([1], [1, 2])).toBeTruthy();
    expect(arrayHasChanges([1, 2], [1])).toBeTruthy();
    expect(arrayHasChanges(["a", "b", "c"], ["d", "e", "f"])).toBeTruthy();
    expect(arrayHasChanges(["a", "b", "c"], ["a", "b", "d"])).toBeTruthy();
    expect(arrayHasChanges([true, true, true], [true, true, false])).toBeTruthy();
  });
});

describe("getObjectDiff", () => {
  test("shallow diff is correct", () => {
    expect(getObjectDiff({ 1: "a", 2: "b", 3: "c" }, { 1: "a", 2: "b", 3: "c" })).toStrictEqual({});
    expect(getObjectDiff({ 1: "a", 2: "b", 3: "c" }, { 1: "a", 2: "b", 3: "d" })).toStrictEqual({ 3: "d" });
    expect(getObjectDiff({ 1: "a", 2: "b", 4: "c" }, { 1: "a", 2: "b", 3: "d" })).toStrictEqual({ 3: "d", "4": null });
  });
  test("nested diff is correct", () => {
    const beforeObject = {
      a: 1,
      eggs: {
        scrambled: true,
        poached: false,
      },
    };
    const afterObject = {
      a: 2,
      eggs: {
        scrambled: false,
        poached: false,
        fried: true,
      },
    };
    expect(getObjectDiff(beforeObject, afterObject)).toStrictEqual({
      a: 2,
      eggs: {
        fried: true,
        scrambled: false,
      },
    });
  });

  test("null to defined creates correct diff", () => {
    const beforeObject = {
      "favourite.egg": null,
    };
    const afterObject = {
      "favourite.egg": "scrambled",
    };

    expect(getObjectDiff(beforeObject, afterObject)).toStrictEqual({
      "favourite.egg": "scrambled",
    });
  });

  test("null to defined object creates correct diff", () => {
    const beforeObject = {
      favourite: {
        egg: null,
      },
    };
    const afterObject = {
      favourite: {
        egg: "scrambled",
      },
    };
    expect(getObjectDiff(beforeObject, afterObject)).toStrictEqual({
      favourite: {
        egg: "scrambled",
      },
    });
  });

  test("change in array order does not create a diff", () => {
    const beforeObject = {
      eggs: ["scrambled", "fried"],
    };
    const afterObject = {
      eggs: ["fried", "scrambled"],
    };

    expect(getObjectDiff(beforeObject, afterObject)).toStrictEqual({});
  });

  test("change in array values creates a diff", () => {
    const beforeObject = {
      eggs: ["scrambled", "fried", "poached"],
    };
    const afterObject = {
      eggs: ["fried", "scrambled"],
    };

    expect(getObjectDiff(beforeObject, afterObject)).toStrictEqual({ eggs: ["fried", "scrambled"] });
  });
});
