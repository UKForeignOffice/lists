import { isGovUKEmailAddress, isCountryNameValid, throwIfConfigVarIsUndefined } from "../validation";
import { countriesList } from "server/services/metadata";

describe("isGovUKEmailAddress", () => {
  const env = { ...process.env };
  beforeEach(() => {});
  afterEach(() => {
    process.env = env;
    jest.restoreAllMocks();
  });

  test("valid email address", () => {
    expect(isGovUKEmailAddress("person.surname@fco.gov.uk")).toBe(true);
    expect(isGovUKEmailAddress("person.surname@fcdo.gov.uk")).toBe(true);
  });

  test("invalid email address", () => {
    expect(isGovUKEmailAddress("person@gmail.com")).toBe(false);
    expect(isGovUKEmailAddress("person.surname@@fco.gov.uk")).toBe(false);
    expect(isGovUKEmailAddress("person.surname@fco")).toBe(false);
    expect(isGovUKEmailAddress("person.surname@fco")).toBe(false);
    expect(isGovUKEmailAddress("@fcdo.gov.uk")).toBe(false);
    expect(isGovUKEmailAddress("fcdo.gov.uk")).toBe(false);
    expect(isGovUKEmailAddress("someone@gov.uk")).toBe(false);
  });

  test("multiple emails fail", () => {
    expect(isGovUKEmailAddress("person@gmail.com,person@fco.gov.uk")).toBe(false);
    expect(isGovUKEmailAddress("person@gov.uk,person@fco.gov.uk")).toBe(false);
  });

  test("with configured allowed email domains", () => {
    /**
     * Set process.env, reset modules, then re-import ./../validation so the new value is used
     */
    process.env.ALLOWED_EMAIL_DOMAINS = "gmail.com,gov.uk";
    jest.resetModules();

    expect(require("./../validation").isGovUKEmailAddress("person@gmail.com")).toBe(true);
    expect(require("./../validation").isGovUKEmailAddress("person@gov.uk")).toBe(true);
    expect(require("./../validation").isGovUKEmailAddress("person@fcdo.gov.uk")).toBe(true);
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
