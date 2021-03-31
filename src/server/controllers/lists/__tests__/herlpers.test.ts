import {
  countryHasLegalAid,
  queryStringFromParams,
  regionFromParams,
} from "../helpers";

describe("Lawyers List:", () => {
  describe("countryHasLegalAid", () => {
    test("result is correct when country has legal aid support", () => {
      expect(countryHasLegalAid("Spain")).toBe(true);
      expect(countryHasLegalAid("spain")).toBe(true);
    });

    test("result is correct when country does not have legal aid support", () => {
      expect(countryHasLegalAid("Thailand")).toBe(false);
      expect(countryHasLegalAid("thailand")).toBe(false);
    });
  });

  describe("queryStringFromParams", () => {
    test("query string is built correctly", () => {
      const params = {
        propA: "a",
        propB: 1,
        propC: "c",
      };

      expect(queryStringFromParams(params)).toEqual("propA=a&propB=1&propC=c");
    });
  });

  describe("Region from params", () => {
    test("region is correct when params is string list", () => {
      const params = {
        region: "madrid",
      };

      expect(regionFromParams(params)).toBe("madrid");
    });

    test("region is correct when only unsure is selected", () => {
      const params = {
        region: "unsure,",
      };

      expect(regionFromParams(params)).toBe("");
    });

    test("region is correct when unsure and a value are passed", () => {
      const params = {
        region: "unsure,madrid",
      };

      expect(regionFromParams(params)).toBe("madrid");
    });
  });
});
