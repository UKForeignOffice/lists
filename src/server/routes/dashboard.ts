/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated } from "server/auth";
import {
  dashboardRoutes,
  listsRouteController,
  startRouteController,
  usersRouteController,
} from "server/controllers/dashboard";

const router = express.Router();

router.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
router.get(dashboardRoutes.start, startRouteController);
router.all(dashboardRoutes.users, usersRouteController);
router.get(dashboardRoutes.lists, listsRouteController);

export default router;
