import { isWithinInterval } from "date-fns";

export function assertValidDateInterval(interval: { start: Date; end: Date }): void {
  const start = interval.start.getTime();
  const end = interval.end.getTime();

  // date-fns v3+ normalizes reversed intervals instead of rejecting them.
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    throw new RangeError("Invalid interval");
  }
}

export function isWithinValidDateInterval(date: Date | number, interval: { start: Date; end: Date }): boolean {
  assertValidDateInterval(interval);
  return isWithinInterval(date, interval);
}
