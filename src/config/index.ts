import { logger } from "services/logger";

export * from "./server-config";
export * from "./database-config";

logger.error("ENV", process.env);
