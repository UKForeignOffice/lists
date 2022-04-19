import { format as dfnFormat } from "date-fns";

export function parseDate(date: string, format: string = "dd/MM/yyyy"): string {
  return dfnFormat(Date.parse(date), format);
}
