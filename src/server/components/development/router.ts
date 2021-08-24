/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
// import { dashboardRoutes } from "server/components/dashboard";
import { deployDb, resetDb, promoteUser } from "./development";

export const developmentRouter = express.Router();

const routes = {
  
}

developmentRouter.get(`dashboard/dev/deploy-db`, deployDb);

// TODO: once prod is ready this route should be available only on localhost
developmentRouter.get(`dashboard/dev/reset-db`, resetDb);

// TODO: once prod is ready this route should be available only on localhost
developmentRouter.get(`dashboard/dev/promote-user`, promoteUser);
