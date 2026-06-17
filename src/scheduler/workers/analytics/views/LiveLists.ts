import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { rowValuesAsColumns } from "./utils";

export async function LiveLists() {
  const rows = await prisma.$queryRaw`select * from "LiveLists"`;
  const header = ["count", "type"];
  const data = rowValuesAsColumns(rows);
  return updateSheet("LiveLists", [header, ...data]);
}
