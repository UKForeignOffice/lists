import { logger as parentLogger } from "scheduler/logger";

export const logger = parentLogger.child({ task: "resendRequestedEditEmail" });
