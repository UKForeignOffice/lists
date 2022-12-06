/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated, ensureUserIsAdministrator } from "server/components/auth";
import {
  startRouteController,
  usersListController,
  usersEditController,
  feedbackController,
  usersEditPostController,
} from "./controllers";
import { dashboardRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";

import { listRouter } from "server/components/dashboard/listsItems/itemsRouter";

export const dashboardRouter = express.Router();

dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

// Users
dashboardRouter.get(dashboardRoutes.usersList, csrfRequestHandler, ensureUserIsAdministrator, usersListController);
dashboardRouter.post(dashboardRoutes.usersEdit, csrfRequestHandler, ensureUserIsAdministrator, usersEditPostController);
dashboardRouter.get(dashboardRoutes.usersEdit, csrfRequestHandler, ensureUserIsAdministrator, usersEditController);

// lists
dashboardRouter.use("/dashboard/lists", listRouter);

dashboardRouter.get(dashboardRoutes.feedback, csrfRequestHandler, ensureUserIsAdministrator, feedbackController);
