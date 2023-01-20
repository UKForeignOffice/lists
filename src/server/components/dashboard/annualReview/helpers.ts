import * as DateFns from "date-fns";
import { DATE_FORMAT } from "server/components/dashboard/annualReview/controllers";
import { ListWithJsonData } from "../helpers";

export function formatAnnualReviewDate(
  list: ListWithJsonData,
  field: "nextAnnualReviewStartDate" | "lastAnnualReviewStartDate",
  dateFormat?: string
): string {
  return list[field] ? formatDate(list[field] as Date, dateFormat) : "";
}

export function formatDate(date: Date | string, formatOptions?: string) {
  const formattedDate: Date = typeof date === "string" ? DateFns.parseISO(date) : date;

  return DateFns.format(formattedDate, formatOptions ?? DATE_FORMAT);
}

export function getMaxDate(): Date {
  const todaysDate = new Date(Date.now());
  return addSixMonths(todaysDate) as Date;
}

export function calculateNewDateAfterPeriod(date: string | Date, period: Record<string, number>) {
  let formattedDate = date;
  if (typeof date === "string") {
    if (!date) {
      return undefined;
    }
    formattedDate = new Date(date);
  }
  const newDate = DateFns.add(formattedDate as Date, period);

  return newDate;
}

function addSixMonths(date: Date): Date | undefined {
  return calculateNewDateAfterPeriod(date, { months: 6 });
}

export function calculateValidDate(userEnteredDate: Date, maxDate: Date): Date | null {
  const userEnteredDateNextYear = DateFns.add(userEnteredDate, { years: 1 });
  const possibleDates = [userEnteredDate, userEnteredDateNextYear];

  const [validDate] = possibleDates.filter(
    (possibleDate) => DateFns.isBefore(possibleDate, maxDate) && DateFns.isAfter(possibleDate, new Date())
  );

  return validDate;
}

export function getAnnualReviewDate(
  day: string,
  month: string
): {
  value: Date | null;
  errorMsg: string | null;
} {
  const maxDate = getMaxDate();

  const invalidResult = { value: null };
  const isLeapYear = month === "2" && day === "29";

  let errorMsg = null;

  if (!month || !day) {
    errorMsg = "Enter a date for the annual review";
    return { ...invalidResult, errorMsg };
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const dateValues: [number, number, number] = [currentYear, Number(month) - 1, Number(day)];
  const userEnteredDate = new Date(Date.UTC(...dateValues));
  const validDate = calculateValidDate(userEnteredDate, maxDate);

  if (isLeapYear || !DateFns.isExists(...dateValues)) {
    errorMsg = "You cannot set the annual review to this date. Please choose another";
    return { ...invalidResult, errorMsg };
  }

  if (!validDate) {
    errorMsg = "You can only change the date up to 6 months after the current date";
    return { ...invalidResult, errorMsg };
  }

  return { value: validDate, errorMsg };
}
