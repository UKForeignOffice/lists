import { isGovUKEmailAddress, isCountryNameValid, throwIfConfigVarIsUndefined } from "../validation";
import { countriesList } from "server/services/metadata";
import * as config from "server/config/server-config";

describe("Utils Validation", () => {
  describe("isGovUKEmailAddress", () => {
    test("valid email address", () => {
      const result = isGovUKEmailAddress("person.surname@fco.gov.uk");
      expect(result).toBe(true);
    });

    test("invalid email address", () => {
      const result = isGovUKEmailAddress("person@gmail.com");
      expect(result).toBe(false);
    });

    test("multiple emails fail", () => {
      const result = isGovUKEmailAddress("person@gmail.com,person@fco.gov.uk");
      expect(result).toBe(false);
    });

    test("it allows any email when isCybDev", () => {
      // eslint-disable-next-line no-import-assign
      Object.assign(config, { isCybDev: true });

      const result = isGovUKEmailAddress("person@gmail.com");
      expect(result).toBe(true);

      // eslint-disable-next-line no-import-assign
      Object.assign(config, { isCybDev: false });
    });
  });

  describe("countryNameIsValid", () => {
    test("all valid countries pass", () => {
      const result = countriesList.every((country) => isCountryNameValid(country.value));
      expect(result).toBe(true);
    });

    test("invalid country name fails", () => {
      const result = isCountryNameValid("XYZ");
      expect(result).toBe(false);
    });
  });

  describe("throwIfConfigVarIsUndefined", () => {
    test("it throws when config variable is undefined", () => {
      expect(() => throwIfConfigVarIsUndefined("SomeVariable")).toThrowError("");
    });

    test("it does not throw when environment variable is present", () => {
      expect(() => throwIfConfigVarIsUndefined("DATABASE_URL")).not.toThrowError();
    });
  });
});
