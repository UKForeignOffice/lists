/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  ensureAuthenticated,
  ensureUserIsSuperAdmin,
} from "server/components/auth";
import {
    startRouteController,
  usersListController,
  usersEditController,
  listsItemsController
} from "./controllers";
import { dashboardRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";

import {listRouter} from "server/components/dashboard/listsItems/itemsRouter";

export const dashboardRouter = express.Router();


dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

dashboardRouter.get('/test/lists/:listId/items', csrfRequestHandler, listsItemsController)
// Users
dashboardRouter.get(
  dashboardRoutes.usersList,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  usersListController
);
dashboardRouter.all(
  dashboardRoutes.usersEdit,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  usersEditController
);

// lists
dashboardRouter.use('/dashboard/lists', listRouter);
