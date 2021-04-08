import { PrismaClient, Prisma } from "@prisma/client";
import { isLocalHost } from "config";

const logLevel: Prisma.LogLevel[] = ["warn", "error"];

if (isLocalHost) {
  logLevel.push("query", "info");
}

export const prisma = new PrismaClient({
  log: logLevel,
});
