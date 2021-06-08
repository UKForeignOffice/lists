/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated, ensureUserIsSuperAdmin } from "server/auth";
import {
  dashboardRoutes,
  listsRouteController,
  startRouteController,
  usersListController,
  usersEditController,
} from "server/controllers/dashboard";

const router = express.Router();

router.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
router.get(dashboardRoutes.start, startRouteController);
router.all(dashboardRoutes.lists, listsRouteController);

// Super Admin routes
// TODO: test ensureUserIsSuperAdmin
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

export default router;
