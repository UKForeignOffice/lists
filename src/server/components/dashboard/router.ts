/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated, ensureUserIsSuperAdmin } from "server/components/auth";
import {
  listsController,
  feedbackController,
  listsEditController,
  startRouteController,
  usersListController,
  usersEditController,
  listsItemsController,
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
  listItemUpdateController,
} from "server/components/dashboard/listsItems/controllers";
import { redirectIfUnauthorised } from "server/components/dashboard/listsItems/helpers";

export const dashboardRouter = express.Router();

dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

// Users
dashboardRouter.get(dashboardRoutes.usersList, csrfRequestHandler, ensureUserIsSuperAdmin, usersListController);
dashboardRouter.all(dashboardRoutes.usersEdit, csrfRequestHandler, ensureUserIsSuperAdmin, usersEditController);

// lists
dashboardRouter.get(dashboardRoutes.lists, csrfRequestHandler, listsController);
dashboardRouter.all(dashboardRoutes.listsEdit, csrfRequestHandler, listsEditController);
dashboardRouter.get(
  dashboardRoutes.listsItems,
  csrfRequestHandler,
  redirectIfUnauthorised,
  // @ts-expect-error
  listsItemsController
);

// list items
dashboardRouter.get(
  dashboardRoutes.listsItem,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemGetController
);
dashboardRouter.post(
  dashboardRoutes.listsItemDelete,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemDeleteController
);
dashboardRouter.post(
  dashboardRoutes.listsItem,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemPostController
);
dashboardRouter.post(
  dashboardRoutes.listsItemPublish,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemPublishController
);
dashboardRouter.post(
  dashboardRoutes.listsItemRequestChanges,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemRequestChangeController
);
dashboardRouter.post(
  dashboardRoutes.listsItemUpdate,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemUpdateController
);
dashboardRouter.post(
  dashboardRoutes.listsItemPin,
  csrfRequestHandler,
  listItemEditRequestValidation,
  redirectIfUnauthorised,
  listItemPinController
);

// feedback
dashboardRouter.get(dashboardRoutes.feedback, csrfRequestHandler, ensureUserIsSuperAdmin, feedbackController);
