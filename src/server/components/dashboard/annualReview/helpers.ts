import * as DateFns from "date-fns";
import { DATE_FORMAT } from "server/components/dashboard/annualReview/controllers";

import type { List } from "server/models/types";

export function formatAnnualReviewDate(
  list: List,
  field: "annualReviewStartDate" | "lastAnnualReviewStartDate"
): string {
  return list.jsonData[field] ? DateFns.format(DateFns.parseISO(list.jsonData[field] as string), DATE_FORMAT) : "";
}

export function getMaxDate(): Date {
  const todaysDate = Date.now();
  return addSixMonths(todaysDate);
}

function addSixMonths(date: number | string | Date): Date {
  const annualReviewDate = typeof date === "string" ? new Date(date) : date;
  const newDate = DateFns.add(annualReviewDate as Date, { months: 6 });

  return newDate;
}

export function calculateValidDate({
  day,
  month,
  maxDate,
}: {
  day: string;
  month: string;
  maxDate: Date;
}): Date | null {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const userEnteredDate = new Date(currentYear, Number(month) - 1, Number(day));
  const userEnteredDateNextYear = new Date(currentYear + 1, Number(month) - 1, Number(day));

  const possibleDates = [userEnteredDate, userEnteredDateNextYear];

  const [validDate] = possibleDates.filter(
    (possibleDate) => DateFns.isBefore(possibleDate, maxDate) && DateFns.isAfter(possibleDate, currentDate)
  );

  return validDate;
}

export function getAnnualReviewDate({ day, month }: { day: string; month: string }): {
  value: Date | null;
  errorMsg: string | null;
} {
  const maxDate = getMaxDate();

  if (!maxDate) throw new Error("confirmNewAnnualReviewDate Error: Max date could not be calculated");

  const invalidResult = { value: null };
  const isLeapYear = month === "2" && day === "29";

  let errorMsg = null;

  if (!month || !day) {
    errorMsg = "Enter a date for the annual review";
    return { ...invalidResult, errorMsg };
  }

  const validDate = calculateValidDate({
    day,
    month,
    maxDate,
  });

  if (isLeapYear || !validDate) {
    errorMsg = "You cannot set the annual review to this date. Please choose another";
    return { ...invalidResult, errorMsg };
  }

  return { value: validDate, errorMsg };
}
