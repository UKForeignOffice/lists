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

export function getAnnualReviewYear({
  day,
  month,
  lastAnnualReview,
}: {
  day?: string;
  month?: string;
  lastAnnualReview: number;
}): number {
  const date = new Date(lastAnnualReview);

  if (!day || !month) return date.getFullYear();

  const userEnteredDate = new Date(date.getFullYear(), Number(month) + 1, Number(day));

  return DateFns.isBefore(userEnteredDate, date) ? date.getFullYear() + 1 : date.getFullYear();
}

export function getAnnualReviewDate({ day, month, list }: { day: string; month: string; list: List }): {
  value: Date | null;
  errorMsg: string | null;
} {
  const lastAnnualReview = list.jsonData.lastAnnualReviewStartDate ?? list.createdAt;
  const annualReviewYear = getAnnualReviewYear({
    day,
    month,
    lastAnnualReview: (list.jsonData.annualReviewStartDate ?? lastAnnualReview) as number,
  });
  const parsedDate = DateFns.parse(`${month}/${day}/${annualReviewYear}`, "P", new Date());
  const maxDate = getMaxDate();
  const invalidResult = { value: null };
  const isLeapYear = month === "2" && day === "29";

  let errorMsg = null;

  if (!maxDate) throw new Error("confirmNewAnnualReviewDate Error: Max date could not be calculated");

  if (!month || !day) {
    errorMsg = "Enter a date for the annual review";
    return { ...invalidResult, errorMsg };
  }

  if (isLeapYear || !DateFns.isValid(parsedDate)) {
    errorMsg = "You cannot set the annual review to this date. Please choose another";
    return { ...invalidResult, errorMsg };
  }

  if (!DateFns.isBefore(parsedDate, maxDate)) {
    errorMsg = "You can only change the date up to 6 months after the current review date";
    return { ...invalidResult, errorMsg };
  }

  return { value: parsedDate, errorMsg };
}
