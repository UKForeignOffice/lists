/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated, ensureUserIsSuperAdmin } from "server/auth";
import {
  dashboardRoutes,
  listsController,
  listsEditController,
  startRouteController,
  usersListController,
  usersEditController,
  listsItemsController,
  listItemsEditController,
  listItemsApproveController,
  listItemsPublishController,
} from "server/controllers/dashboard";

const router = express.Router();

router.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
router.get(dashboardRoutes.start, startRouteController);

// Users
router.get(
  dashboardRoutes.usersList,
  ensureUserIsSuperAdmin,
  usersListController
);
router.all(
  dashboardRoutes.usersEdit,
  ensureUserIsSuperAdmin,
  usersEditController
);

// lists
router.get(dashboardRoutes.lists, listsController);
router.all(dashboardRoutes.listsEdit, listsEditController);
router.get(dashboardRoutes.listsItems, listsItemsController);

// list items
router.put(dashboardRoutes.listsItemsEdit, listItemsEditController);
router.put(dashboardRoutes.listsItemsApprove, listItemsApproveController);
router.put(dashboardRoutes.listsItemsPublish, listItemsPublishController);

export default router;
