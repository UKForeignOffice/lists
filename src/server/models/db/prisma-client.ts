import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../../services/logger";
import { isLocalHost } from "../../config";

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

prisma.$on("beforeExit", () => {
  logger.info("Prisma is exiting");
});
