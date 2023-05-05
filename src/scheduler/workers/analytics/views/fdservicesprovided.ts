import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { getHeadersFromRow, rowValuesAsColumns } from "./utils";

export async function fdservicesprovided() {
  const rows: any[] = await prisma.$queryRaw`select * from "fdservicesprovided"`;
  const header = getHeadersFromRow(rows[0]);
  const data = rowValuesAsColumns(rows);

  return updateSheet("fdservicesprovided", [header, ...data]);
}
