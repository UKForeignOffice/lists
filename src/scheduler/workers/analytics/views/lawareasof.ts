import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { getHeadersFromRow, rowValuesAsColumns } from "./utils";

export async function lawareasof() {
  const rows = await prisma.$queryRaw<Record<string, unknown>[]>`select * from "lawareasof"`;

  const header = getHeadersFromRow(rows[0]);
  const data = rowValuesAsColumns(rows);

  return updateSheet("lawareasof", [header, ...data]);
}
