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
dashboardRouter.all(
  dashboardRoutes.listsEdit,
  csrfRequestHandler,
  listsEditController
);
dashboardRouter.get(
  dashboardRoutes.listsItems,
  csrfRequestHandler,
  // @ts-expect-error
  listsItemsController
);

// list items
dashboardRouter.get(dashboardRoutes.listsItem, csrfRequestHandler, listItemEditRequestValidation, listItemGetController);
dashboardRouter.post(dashboardRoutes.listsItemDelete, csrfRequestHandler, listItemEditRequestValidation, listItemDeleteController);
dashboardRouter.post(dashboardRoutes.listsItem, csrfRequestHandler, listItemEditRequestValidation, listItemPostController);
dashboardRouter.post(dashboardRoutes.listsItemPublish, csrfRequestHandler, listItemEditRequestValidation, listItemPublishController);
dashboardRouter.post(dashboardRoutes.listsItemRequestChanges, csrfRequestHandler, listItemEditRequestValidation, listItemRequestChangeController);
dashboardRouter.post(dashboardRoutes.listsItemUpdate, csrfRequestHandler, listItemEditRequestValidation, listItemUpdateController);
dashboardRouter.post(dashboardRoutes.listsItemPin, csrfRequestHandler, listItemEditRequestValidation, listItemPinController);
dashboardRouter.post(dashboardRoutes.listsItem, csrfRequestHandler, listItemEditRequestValidation, listItemUpdateController);

// feedback
dashboardRouter.get(
  dashboardRoutes.feedback,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  feedbackController
);
