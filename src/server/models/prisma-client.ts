import { PrismaClient, Prisma } from "@prisma/client";
import { isLocal } from "config";

const logLevel: Prisma.LogLevel[] = ["warn", "error"];

if (isLocal()) {
  logLevel.push("query", "info");
}

export const prisma = new PrismaClient({
  log: logLevel,
});
