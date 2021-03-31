import { PrismaClient } from "@prisma/client";
import { LogLevel } from "prisma";
import { isLocal } from "config";

const logLevel: LogLevel[] = ["warn", "error"];

if (isLocal()) {
  logLevel.push("query", "info");
}

export const prisma = new PrismaClient({
  log: logLevel,
});
