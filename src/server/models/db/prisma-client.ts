import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import { isLocalHost, isSmokeTest } from "server/config";

import { logger } from "server/services/logger";

const logLevel: Prisma.LogDefinition[] = [
  {
    emit: "event",
    level: "error",
  },
  {
    emit: "event",
    level: "warn",
  },
];

if (isLocalHost) {
  logLevel.push(
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "info",
    }
  );
}

export const prisma = new PrismaClient({
  log: logLevel,
});

prisma.$connect().catch((error) => {
  logger.error(`Prisma Connect Error ${error.message}`);
});

// @ts-expect-error
prisma.$on("query", (e: Prisma.QueryEvent) => {
  if (!isSmokeTest) {
    logger.info(`
      Prisma Query: ${e.query} \r\n
      Duration: ${e.duration}ms \r\n
      Params: ${e.params}
    `);
  }
});

// @ts-expect-error
prisma.$on("warn", (e) => {
  logger.warn(e);
});

// @ts-expect-error
prisma.$on("info", (e) => {
  logger.info(e);
});

// @ts-expect-error
prisma.$on("error", (e) => {
  logger.error(e);
});

process.on("beforeExit", () => {
  logger.info("Prisma is exiting");
});
