import { logger as parentLogger } from "server/services/logger";

export const relatedLinksLogger = parentLogger.child({ route: "/related-links" });
