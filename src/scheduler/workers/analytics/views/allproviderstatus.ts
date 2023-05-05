import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { getHeadersFromRow, rowValuesAsColumns } from "./utils";

export async function allproviderstatus() {
  const rows = (await prisma.$queryRaw`select * from "allproviderstatus"`) as any[];
  const header = getHeadersFromRow(rows[0]);
  const data = rowValuesAsColumns(rows);
  return updateSheet("allproviderstatus", [header, ...data]);
}
