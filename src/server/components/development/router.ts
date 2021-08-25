/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { deployDb, resetDb, promoteUser } from "./controllers";
import { ensureAuthenticated } from "server/components/auth";
import { developmentRoutes } from "./routes";

export const developmentRouter = express.Router();

developmentRouter.get(`/development*`, ensureAuthenticated);

// deploy db to apply future database migration changes
developmentRouter.get(developmentRoutes.deployDb, deployDb);

// TODO: once prod is ready this route should be available only on localhost
developmentRouter.get(developmentRoutes.resetDb, resetDb);

// TODO: once prod is ready this route should be available only on localhost
developmentRouter.get(developmentRoutes.promoteUser, promoteUser);
