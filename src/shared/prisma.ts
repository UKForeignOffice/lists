import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

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
