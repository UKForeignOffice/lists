import { isGovUKEmailAddress } from "../validation";

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
});
