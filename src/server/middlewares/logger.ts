import { Express } from "express";
import expressWinston from "express-winston";
import { logger } from "server/services/logger";
import { DEBUG } from "server/config";

export function configureLogger(server: Express): void {
  server.use(
    expressWinston.logger({
      winstonInstance: logger,
      meta: DEBUG,
    })
  );
}
