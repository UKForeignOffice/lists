import { geoPointIsValid, rawInsertGeoLocation } from "../helpers";
import { getDbPool } from "../db/database";

describe("Models Helpers", () => {
  const spyDBQuery = (returnValue: { rows: Array<{ id: string }> }): jest.SpyInstance => {
    // @ts-expect-error-next-line
    return jest.spyOn(getDbPool(), "query").mockResolvedValue(returnValue);
  };

  describe("rawInsertGeoLocation", () => {
    test("RawInsert query is correct", async () => {
      const spy = spyDBQuery({ rows: [{ id: "123ID" }] });
      const point = [2.1390100000000416, 41.49279000000007];
      const result = await rawInsertGeoLocation(point);

      expect(result).toBe("123ID");
      expect(spy.mock.calls[0][0].trim()).toEqual(
        `INSERT INTO public."GeoLocation" (location) VALUES ('POINT(${point[0]} ${point[1]})') RETURNING id`
      );
    });
  });

  describe("geoPointIsValid", () => {
    test("geoPointIsValid return true when valid", () => {
      expect(geoPointIsValid([1.0, 2.0])).toBe(true);
    });

    test("geoPointIsValid return false when invalid", () => {
      expect(geoPointIsValid("IncorrectValue")).toBe(false);
    });
  });
});
