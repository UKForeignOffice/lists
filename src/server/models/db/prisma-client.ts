import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "server/services/logger";
import { isLocalHost } from "server/config";

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

// @ts-expect-error
prisma.$on("query", (e: Prisma.QueryEvent) => {
  logger.info(`
    Prisma Query: ${e.query} \r\n
    Duration: ${e.duration}ms
  `);
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
