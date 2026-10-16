import { addDaysFromISODate, subDaysFromISODate } from "../helpers.keyDates";

const testInLondonTimeZone = process.env.TZ === "Europe/London" ? test : test.skip;

testInLondonTimeZone("key date calculations preserve local calendar days across the spring DST change", () => {
  expect(addDaysFromISODate("2024-03-30T00:00:00", 2)).toBe("2024-03-31T23:00:00.000Z");
  expect(subDaysFromISODate("2024-04-01T00:00:00", 2)).toBe("2024-03-30T00:00:00.000Z");
});

test("key date calculations cross the year boundary", () => {
  expect(addDaysFromISODate("2023-12-31T00:00:00Z", 1)).toBe("2024-01-01T00:00:00.000Z");
  expect(subDaysFromISODate("2024-01-01T00:00:00Z", 1)).toBe("2023-12-31T00:00:00.000Z");
});
