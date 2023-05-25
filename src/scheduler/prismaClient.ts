import { logger } from "scheduler/logger";
import addLogsToPrismaClient from "shared/prisma";

export const prisma = addLogsToPrismaClient(logger);
