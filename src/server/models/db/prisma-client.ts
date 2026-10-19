import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

import { isLocalHost, isSmokeTest } from "server/config";

import { logger } from "server/services/logger";
import { createPrismaAdapter } from "shared/prismaAdapter";

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
  adapter: createPrismaAdapter(),
  log: logLevel,
});

prisma.$connect().catch((error) => {
  logger.error(`Prisma Connect Error ${error.message}`);
});

prisma.$on("query", (e: Prisma.QueryEvent) => {
  if (!isSmokeTest) {
    logger.info(`
      Prisma Query: ${e.query} \r\n
      Duration: ${e.duration}ms \r\n
      Params: ${e.params}
    `);
  }
});

prisma.$on("warn", (e) => {
  logger.warn(e);
});

prisma.$on("info", (e) => {
  logger.info(e);
});

prisma.$on("error", (e) => {
  logger.error(e);
});

process.on("beforeExit", () => {
  logger.info("Prisma is exiting");
});
