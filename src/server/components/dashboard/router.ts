/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import {
  ensureAuthenticated,
  ensureUserIsSuperAdmin,
} from "server/components/auth";
import {
  listsController,
  listsEditController,
  startRouteController,
  usersListController,
  usersEditController,
  listsItemsController,
  listItemsApproveController,
  listItemsPublishController,
} from "./dashboard";

export const dashboardRoutes = {
  start: "/dashboard",

  // users
  usersList: "/dashboard/users",
  usersEdit: "/dashboard/users/:userEmail",

  // lists
  lists: "/dashboard/lists",
  listsEdit: "/dashboard/lists/:listId",
  listsItems: "/dashboard/lists/:listId/items",
  listsItemsApprove: "/dashboard/lists/:listId/items/:listItemId/approve",
  listsItemsPublish: "/dashboard/lists/:listId/items/:listItemId/publish",
};

export const dashboardRouter = express.Router();

dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

// Users
dashboardRouter.get(
  dashboardRoutes.usersList,
  ensureUserIsSuperAdmin,
  usersListController
);
dashboardRouter.all(
  dashboardRoutes.usersEdit,
  ensureUserIsSuperAdmin,
  usersEditController
);

// lists
dashboardRouter.get(dashboardRoutes.lists, listsController);
dashboardRouter.all(dashboardRoutes.listsEdit, listsEditController);
dashboardRouter.get(dashboardRoutes.listsItems, listsItemsController);

// list items
dashboardRouter.put(dashboardRoutes.listsItemsApprove, listItemsApproveController);
dashboardRouter.put(dashboardRoutes.listsItemsPublish, listItemsPublishController);
