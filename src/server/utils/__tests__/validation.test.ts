import { isGovUKEmailAddress, isCountryNameValid } from "../validation";
import { countriesList } from "server/services/metadata";

describe("Utils Validation", () => {
  describe("isGovUKEmailAddress", () => {
    test("valid email address", () => {
      const result = isGovUKEmailAddress("person.surname@fco.gov.uk");
      expect(result).toBe(true);
    });

    test("valid email address", () => {
      const result = isGovUKEmailAddress("person@gmail.com");
      expect(result).toBe(false);
    });

    test("multiple emails fail", () => {
      const result = isGovUKEmailAddress("person@gmail.com,person@fco.gov.uk");
      expect(result).toBe(false);
    });
  });

  describe("countryNameIsValid", () => {
    test("all valid countries pass", () => {
      const result = countriesList.every((country) =>
        isCountryNameValid(country.value)
      );
      expect(result).toBe(true);
    });

    test("invalid country name fails", () => {
      const result = isCountryNameValid("Xortugal");
      expect(result).toBe(false);
    });
  });
});
