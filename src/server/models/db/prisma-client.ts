import type { Prisma } from "@prisma/client";
import { logger } from "server/services/logger";

import { prisma } from "shared/prisma";

prisma.$connect().catch((error) => {
  logger.error(`Prisma Connect Error ${error.message}`);
});

// @ts-expect-error
prisma.$on("query", (e: Prisma.QueryEvent) => {
  logger.info(`
    Prisma Query: ${e.query} \r\n
    Duration: ${e.duration}ms \r\n
    Params: ${e.params}
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
