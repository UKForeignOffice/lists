import { prisma } from "scheduler/workers/model";
import { updateSheet } from "./../googleClient";
import { rowValuesAsColumns } from "./utils";

export async function LiveLists() {
  const rows = (await prisma.$queryRaw`select * from "LiveLists"`) as any[];
  const header = ["count", "type"];
  const data = rowValuesAsColumns(rows);
  return await updateSheet("LiveLists", [header, ...data]);
}
