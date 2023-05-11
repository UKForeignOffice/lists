import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { getHeadersFromRow, rowValuesAsColumns } from "./utils";

export async function intservicesprovided() {
  const rows: any[] = await prisma.$queryRaw`select * from "intservicesprovided"`;
  const header = getHeadersFromRow(rows[0]);
  const data = rowValuesAsColumns(rows);
  return await updateSheet("intservicesprovided", [header, ...data]);
}
