/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  ensureAuthenticated,
  ensureUserIsSuperAdmin,
} from "server/components/auth";
import {
  startRouteController,
  usersListController,
  feedbackController,
  usersEditController,
  helpPageController,
} from "./controllers";
import { dashboardRoutes } from "./routes";
import { csrfRequestHandler, addUrlToSession } from "server/components/cookies/helpers";

import {listRouter} from "server/components/dashboard/listsItems/itemsRouter";

export const dashboardRouter = express.Router();


dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

// help
dashboardRouter.get(
  dashboardRoutes.listsHelp,
  helpPageController
);

// Users
dashboardRouter.get(
  dashboardRoutes.usersList,
  csrfRequestHandler,
  addUrlToSession,
  ensureUserIsSuperAdmin,
  usersListController
);
dashboardRouter.all(
  dashboardRoutes.usersEdit,
  csrfRequestHandler,
  addUrlToSession,
  ensureUserIsSuperAdmin,
  usersEditController
);

// lists
dashboardRouter.use('/dashboard/lists', listRouter);

dashboardRouter.get(
  dashboardRoutes.feedback,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  addUrlToSession,
  feedbackController
);
