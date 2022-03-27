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
  listsItemsController,
  listItemsApproveController,
  listItemsPublishController,
  listItemsDeleteController,
  listItemsEditGetController,
  listItemsEditPostController,
  listItemEditRequestValidation
} from "./controllers";
import { dashboardRoutes } from "./routes";
import { csrfRequestHandler } from "server/components/cookies/helpers";

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
dashboardRouter.all(dashboardRoutes.listsEdit, csrfRequestHandler, listsEditController);
dashboardRouter.get(dashboardRoutes.listsItems, csrfRequestHandler, listsItemsController);

// list items
dashboardRouter.put(
  dashboardRoutes.listsItemsApprove,
  csrfRequestHandler,
  listItemsApproveController
);
dashboardRouter.put(
  dashboardRoutes.listsItemsPublish,
  csrfRequestHandler,
  listItemsPublishController
);
dashboardRouter.delete(
  dashboardRoutes.listsItemsDelete,
  listItemsDeleteController
);
dashboardRouter.get(dashboardRoutes.listsItemsEdit, csrfRequestHandler, listItemEditRequestValidation, listItemsEditGetController);
dashboardRouter.post(dashboardRoutes.listsItemsEdit, csrfRequestHandler, listItemEditRequestValidation, listItemsEditPostController);

// feedback
dashboardRouter.get(
  dashboardRoutes.feedback,
  csrfRequestHandler,
  ensureUserIsSuperAdmin,
  feedbackController
);
