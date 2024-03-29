/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { deployDb, resetDb, promoteUser } from "./controllers";
import { ensureAuthenticated } from "server/components/auth";
import { developmentRoutes } from "./routes";
import { isLocalHost } from "server/config";

export const developmentRouter = express.Router();

developmentRouter.get(`/development*`, ensureAuthenticated);

// deploy db to apply future database migration changes
developmentRouter.get(developmentRoutes.deployDb, deployDb);

if (isLocalHost) {
  developmentRouter.get(developmentRoutes.resetDb, resetDb);
  developmentRouter.get(developmentRoutes.promoteUser, promoteUser);
}
