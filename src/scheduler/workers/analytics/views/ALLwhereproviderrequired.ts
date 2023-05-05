import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { rowValuesAsColumns } from "./utils";

export async function ALLwhereproviderrequired() {
  const rows =
    (await prisma.$queryRaw`select whereproviderrequired, count(*) from "ALLwhereproviderrequired" group by "whereproviderrequired"`) as any[];
  const header = Object.keys(rows[0]);
  const data = rowValuesAsColumns(rows);
  return updateSheet("ALLwhereproviderrequired", [header, ...data]);
}
