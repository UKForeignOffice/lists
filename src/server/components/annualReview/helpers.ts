export function getAdjustedDateForDatePart(datePart: string, adjustBy: number): Date {
  const date = new Date();
  if (datePart === "month") {
    date.setMonth(date.getMonth() + adjustBy);

  } else {
    date.setDate(date.getDate() + adjustBy);
  }
  date.setHours(0, 0, 0, 0);
  return date;
}
