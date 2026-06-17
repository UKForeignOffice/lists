import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { getHeadersFromRow, rowValuesAsColumns } from "./utils";

export async function allproviderstatus() {
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`select * from "allproviderstatus"`;
  const header = getHeadersFromRow(rows[0]);
  const data = rowValuesAsColumns(rows);
  return updateSheet("allproviderstatus", [header, ...data]);
}
