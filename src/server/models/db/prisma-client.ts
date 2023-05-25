import { logger } from "server/services/logger";
import addLogsToPrismaClient from "shared/prisma";

export const prisma = addLogsToPrismaClient(logger);
