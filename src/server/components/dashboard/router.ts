/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  ensureAuthenticated,
  ensureUserIsSuperAdmin,
} from "server/components/auth";
import {
  listsController,
  feedbackController,
  listsEditController,
  startRouteController,
  usersListController,
  usersEditController,
  listsItemsController
} from "./controllers";
import { dashboardRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";
import {
  listItemDeleteController,
  listItemEditRequestValidation,
  listItemGetController,
  listItemPinController,
  listItemPostController,
  listItemPublishController,
  listItemRequestChangeController,
  listItemUpdateController
} from "server/components/dashboard/listsItems/controllers";
import { redirectIfUnauthorised } from "server/components/dashboard/listsItems/helpers";

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
dashboardRouter.get(dashboardRoutes.lists, csrfRequestHandler, listsController);
dashboardRouter.get(`${dashboardRoutes.lists}/*`, redirectIfUnauthorised, csrfRequestHandler, listsController);
dashboardRouter.all(
  dashboardRoutes.listsEdit,
  redirectIfUnauthorised,
  csrfRequestHandler,
  listsEditController
);
dashboardRouter.get(
  dashboardRoutes.listsItems,
  csrfRequestHandler,
  redirectIfUnauthorised,
  // @ts-expect-error
  listsItemsController
);

// list items
dashboardRouter.all('/dashboard/lists/:listId/items/*', csrfRequestHandler, listItemEditRequestValidation, redirectIfUnauthorised)
dashboardRouter.get(dashboardRoutes.listsItem, listItemGetController);
dashboardRouter.post(dashboardRoutes.listsItemDelete, listItemDeleteController);
dashboardRouter.post(dashboardRoutes.listsItem, listItemPostController);
dashboardRouter.post(dashboardRoutes.listsItemPublish, listItemPublishController);
dashboardRouter.post(dashboardRoutes.listsItemRequestChanges, listItemRequestChangeController);
dashboardRouter.post(dashboardRoutes.listsItemUpdate, listItemUpdateController);
dashboardRouter.post(dashboardRoutes.listsItemPin, listItemPinController);

// feedback
dashboardRouter.get(
  dashboardRoutes.feedback,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  feedbackController
);
