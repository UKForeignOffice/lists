import { assertValidDateInterval, isWithinValidDateInterval } from "../isWithinValidDateInterval";

test.each([
  { start: "2024-05-01", end: "2024-04-01" },
  { start: "invalid", end: "2024-04-01" },
  { start: "2024-04-01", end: "invalid" },
])("rejects a reversed or invalid interval from $start to $end", ({ start, end }) => {
  const interval = {
    start: new Date(start),
    end: new Date(end),
  };

  expect(() => assertValidDateInterval(interval)).toThrow(new RangeError("Invalid interval"));
  expect(() => isWithinValidDateInterval(new Date("2024-04-15"), interval)).toThrow(new RangeError("Invalid interval"));
});

test.each([
  ["2024-04-01", true],
  ["2024-04-15", true],
  ["2024-04-30", true],
  ["2024-05-01", false],
])("preserves inclusive interval membership for %s", (date, expected) => {
  expect(
    isWithinValidDateInterval(new Date(date), {
      start: new Date("2024-04-01"),
      end: new Date("2024-04-30"),
    })
  ).toBe(expected);
});
