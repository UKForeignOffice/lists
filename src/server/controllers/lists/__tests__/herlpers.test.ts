import {
  countryHasLegalAid,
  queryStringFromParams,
  regionFromParams,
  practiceAreaFromParams,
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getCountryLawyerRedirectLink,
} from "../helpers";
import { fcdoLawyersPagesByCountry } from "services/metadata";
import { startCase, get } from "lodash";

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

  describe("regionFromParams", () => {
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

  describe("practiceAreaFromParams", () => {
    test("returns practiceArea array when array", () => {
      const params = {
        practiceArea: ["Corporate", "Real Estate"],
      };

      expect(practiceAreaFromParams(params)).toEqual(params.practiceArea);
    });

    test("returns practiceArea array when string", () => {
      const params = {
        practiceArea: "Corporate, Real Estate",
      };

      expect(practiceAreaFromParams(params)).toEqual([
        "Corporate",
        "Real Estate",
      ]);
    });
  });

  describe("getAllRequestParams", () => {
    test("request params, body and query are merged together", () => {
      const req: any = {
        body: {
          bodyProp: true,
        },
        params: {
          paramsProp: true,
        },
        query: {
          queryProp: true,
        },
      };

      expect(getAllRequestParams(req)).toEqual({
        ...req.body,
        ...req.params,
        ...req.query,
      });
    });
  });

  describe("getServiceLabel", () => {
    // this method is used in views
    test("lawyers label is returned correctly", () => {
      expect(getServiceLabel("lawyers")).toEqual("a lawyer");
    });

    test("medical assistance label is returned correctly", () => {
      expect(getServiceLabel("medical facilities")).toEqual(
        "medical assistance"
      );
    });

    test("undefined is returned when service name is unknown", () => {
      expect(getServiceLabel("famous singer phone number")).toEqual(undefined);
    });
  });

  describe("removeQueryParameter", () => {
    test("parameter is removed correctly from query string", () => {
      const queryString =
        "serviceType=lawyers&readNotice=ok&country=spain&region=madrid&practiceArea=maritime%2Creal%20estate&legalAid=no";
      expect(removeQueryParameter(queryString, "country")).toBe(
        "serviceType=lawyers&readNotice=ok&region=madrid&practiceArea=maritime%2Creal%20estate&legalAid=no"
      );
    });
  });

  describe("getCountryLawyerRedirectLink", () => {
    test("redirect link is for Spain correct", () => {
      [
        "ghana",
        "burma",
        "spain",
        "italy",
        "thailand",
        "Antigua and Barbuda",
        "Cote d’Ivoire",
      ].forEach((country: any) => {
        const link = getCountryLawyerRedirectLink(country);
        const expectedLink = get(
          fcdoLawyersPagesByCountry,
          Object.keys(fcdoLawyersPagesByCountry).find(
            (key) => key.toLowerCase() === country.toLowerCase()
          ) as string
        );
        
        expect(link).toBe(expectedLink);
        expect(expectedLink).toBeDefined();
      });
    });

    test("redirect link for unknown country is correct", () => {
      expect(getCountryLawyerRedirectLink("Tycho" as any)).toBe(
        "https://www.gov.uk/government/collections/list-of-lawyers"
      );
    });
  });

  describe("countryHasLegalAid", () => {
    test("it returns true when country has legal aid support", () => {
      expect(countryHasLegalAid("cyprus")).toBe(true);
    });
    test("it returns false when country has legal aid support", () => {
      expect(countryHasLegalAid("thailand")).toBe(false);
    });
  });
});
