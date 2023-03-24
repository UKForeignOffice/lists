import { startDateFromFirstPublishedDate } from "../startDateFromFirstPublishedDate";

test("returns a date 1 year in the future when firstPublishedDate is upto 11 months in the past", () => {
  jest.useFakeTimers("modern");
  jest.useFakeTimers().setSystemTime(new Date("2023-03-01"));

  expect(startDateFromFirstPublishedDate(new Date("2023-02-01"), 1)).toBe("2024-02-01");
  expect(startDateFromFirstPublishedDate(new Date("2023-01-01"), 1)).toBe("2024-01-01");
  expect(startDateFromFirstPublishedDate(new Date("2022-12-01"), 1)).toBe("2023-12-01");
  expect(startDateFromFirstPublishedDate(new Date("2022-04-01"), 1)).toBe("2023-04-01");
});

test("returns a valid date when firstPublished was on a leap day", () => {
  jest.useFakeTimers("modern");
  jest.useFakeTimers().setSystemTime(new Date("2024-06-01"));
  expect(startDateFromFirstPublishedDate(new Date("2024-02-29"), 1)).toBe("2025-02-28");
});

describe("returns a date 29 days from now", () => {
  beforeEach(() => {
    jest.useFakeTimers("modern");
    jest.useFakeTimers().setSystemTime(new Date("2023-03-01"));
  });
  test("when firstPublished was over 11 months ago", () => {
    expect(startDateFromFirstPublishedDate(new Date("2022-02-01"), 1)).toBe("2023-03-30");
    expect(startDateFromFirstPublishedDate(new Date("2020-01-01"), 1)).toBe("2023-03-30");
    expect(startDateFromFirstPublishedDate(new Date("2019-01-01"), 1)).toBe("2023-03-30");
  });

  test("when firstPublished was between 11 and 12 months ago", () => {
    expect(startDateFromFirstPublishedDate(new Date("2022-03-02"), 1)).toBe("2023-03-30");
    expect(startDateFromFirstPublishedDate(new Date("2022-03-15"), 1)).toBe("2023-03-30");
    expect(startDateFromFirstPublishedDate(new Date("2022-03-20"), 1)).toBe("2023-03-30");
    expect(startDateFromFirstPublishedDate(new Date("2022-03-28"), 1)).toBe("2023-03-30");
    expect(startDateFromFirstPublishedDate(new Date("2022-03-29"), 1)).toBe("2023-03-30");
  });
});
