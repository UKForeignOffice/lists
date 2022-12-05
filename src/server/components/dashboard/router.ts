/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated, ensureUserIsSuperAdmin } from "server/components/auth";
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
dashboardRouter.get(dashboardRoutes.usersList, csrfRequestHandler, ensureUserIsSuperAdmin, usersListController);
dashboardRouter.post(dashboardRoutes.usersEdit, csrfRequestHandler, ensureUserIsSuperAdmin, usersEditPostController);
dashboardRouter.get(dashboardRoutes.usersEdit, csrfRequestHandler, ensureUserIsSuperAdmin, usersEditController);

// lists
dashboardRouter.use("/dashboard/lists", listRouter);

dashboardRouter.get(dashboardRoutes.feedback, csrfRequestHandler, ensureUserIsSuperAdmin, feedbackController);
