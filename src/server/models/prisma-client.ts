import { PrismaClient, Prisma } from "@prisma/client";
import { isLocalHost, isTest } from "server/config";

const logLevel: Prisma.LogLevel[] = [];

if (!isTest) {
  logLevel.push("warn", "error");
}

if (isLocalHost) {
  logLevel.push("query", "info");
}

export const prisma = new PrismaClient({
  log: logLevel,
});
