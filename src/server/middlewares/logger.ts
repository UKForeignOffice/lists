import { RequestHandler } from "express";
import expressWinston from "express-winston";
import { logger } from "server/services/logger";
import { DEBUG } from "server/config";

export default (): RequestHandler => {
  return expressWinston.logger({
    winstonInstance: logger,
    meta: DEBUG,
  });
};
