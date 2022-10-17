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
  listsItemsController,
  listsEditPostController,
  listPublisherDelete,
} from "./controllers";
import { dashboardRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";

import {listRouter} from "server/components/dashboard/listsItems/itemsRouter";

export const dashboardRouter = express.Router();


dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

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
dashboardRouter.get(dashboardRoutes.lists, csrfRequestHandler, listsController);
dashboardRouter.get(
  dashboardRoutes.listsEdit,
  csrfRequestHandler,
  listsEditController
);
dashboardRouter.post(
  dashboardRoutes.listsEdit,
  csrfRequestHandler,
  listsEditPostController
);
dashboardRouter.post(
  dashboardRoutes.listsPublisherDelete,
  csrfRequestHandler,
  listPublisherDelete
);
dashboardRouter.get(
  dashboardRoutes.listsItems,
  csrfRequestHandler,
  redirectIfUnauthorised,
  // @ts-expect-error
  listsItemsController
);

dashboardRouter.get(
  dashboardRoutes.feedback,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  feedbackController
);
