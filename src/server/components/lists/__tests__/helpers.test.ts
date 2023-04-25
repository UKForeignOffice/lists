import {
  countryHasLegalAid,
  queryStringFromParams,
  parseListValues,
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getCountryLawyerRedirectLink,
  createConfirmationLink,
  createListSearchBaseLink,
} from "../helpers";
import { fcdoLawyersPagesByCountry } from "server/services/metadata";
import { assign, get } from "lodash";
import { SERVICE_DOMAIN } from "server/config";
import * as serverConfig from "server/config/server-config";

describe("Lawyers List:", () => {
  describe("countryHasLegalAid", () => {
    test("result is correct when country has legal aid support", () => {
      expect(countryHasLegalAid("Spain")).toBe(true);
      expect(countryHasLegalAid("spain")).toBe(true);
      expect(countryHasLegalAid("bosnia and Herzegovina")).toBe(true);
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
        propD: ["fried", "poached", "scrambled", ""],
      };

      expect(queryStringFromParams(params)).toEqual(
        "propA=a&propB=1&propC=c&propD=fried,poached,scrambled"
      );
    });

    test("query string is built correctly when value is preceded comma", () => {
      const params = {
        propA: ",a",
        propB: 1,
        propC: "c",
      };

      expect(queryStringFromParams(params)).toEqual("propA=a&propB=1&propC=c");
    });
  });

  describe("parseListValues", () => {
    test("values are correct when param is an array", () => {
      const params: any = {
        a: ["a", "b", "", undefined],
      };

      const result = parseListValues("a", params);

      expect(result).toEqual(["a", "b"]);
    });

    test("values are correct when param is a string", () => {
      const params: any = {
        a: "a,b,",
      };

      const result = parseListValues("a", params);

      expect(result).toEqual(["a", "b"]);
    });
  });

  describe("practiceAreaFromParams", () => {
    test("returns practiceArea array when array", () => {
      const params = {
        practiceArea: ["Corporate", "Real Estate"],
      };

      expect(parseListValues("practiceArea", params)).toEqual(
        params.practiceArea
      );
    });

    test("returns practiceArea array when string", () => {
      const params = {
        practiceArea: "Corporate, Real Estate",
      };

      expect(parseListValues("practiceArea", params)).toEqual([
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

    test("Covid test provider label is returned correctly", () => {
      expect(getServiceLabel("covidTestProviders")).toEqual(
        "a COVID-19 test provider"
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
        "myanmar",
        "spain",
        "italy",
        "thailand",
        "Antigua and Barbuda",
        "Côte d'Ivoire",
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
        "/no-list-exists?serviceType=lawyers&country=Tycho"
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

  describe("createConfirmationLink", () => {
    test("confirmation link is correct", () => {
      const req: any = {
        headers: {
          host: "localhost",
        },
        protocol: "https",
      };
      expect(createConfirmationLink(req, "123")).toBe(
        `https://${SERVICE_DOMAIN}/confirm/123`
      );
    });
  });

  describe("createListSearchBaseLink", () => {
    test("search link is correct", () => {
      const listItem: any = {
        type: "covidTestProviders",
      };

      const link = createListSearchBaseLink(listItem.type);

      expect(link).toBe(
        "https://test-domain/find?serviceType=covidTestProviders"
      );
    });

    test("it throws when listItem is undefined", () => {
      const listItem: any = {
        type: undefined,
      };

      expect(() => createListSearchBaseLink(listItem.type)).toThrowError(
        "createListSearchBaseLink serviceType is undefined"
      );
    });

    test("protocol is http on localhost", () => {
      assign(serverConfig, { isLocalHost: true });
      jest.resetModules();

      const listItem: any = { type: "covidTestProviders" };

      const link = createListSearchBaseLink(listItem.type);

      expect(link).toBe(
        "http://test-domain/find?serviceType=covidTestProviders"
      );

      assign(serverConfig, { isLocalHost: false });
      jest.resetModules();
    });
  });
});
