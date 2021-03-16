import { RequestHandler } from "express";
import expressWinston from "express-winston";
import { logger } from "services/logger";
import { DEBUG } from "config";

export default (): RequestHandler => {
  return expressWinston.logger({
    winstonInstance: logger,
    meta: DEBUG,
  });
};
