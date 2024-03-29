/* eslint-disable @typescript-eslint/no-misused-promises */
import express from "express";
import { ensureAuthenticated, ensureUserIsAdministrator } from "server/components/auth";
import {
  startRouteController,
  usersListController,
  feedbackController,
  usersEditController,
  helpPageController,
  usersEditPostController,
  userDeleteGetController,
  userDeletePostController,
} from "./controllers/controllers";
import { dashboardRoutes } from "./routes";
import { addUrlToSession } from "server/components/cookies/helpers";
import { listRouter } from "./listRouter";

export const dashboardRouter = express.Router();

dashboardRouter.get(`${dashboardRoutes.start}*`, ensureAuthenticated);
dashboardRouter.get(dashboardRoutes.start, startRouteController);

// help
dashboardRouter.get(dashboardRoutes.listsHelp, helpPageController);

// Users
dashboardRouter.all(`${dashboardRoutes.usersList}*`, ensureUserIsAdministrator, addUrlToSession);
dashboardRouter.get(dashboardRoutes.usersList, usersListController);
dashboardRouter.post(dashboardRoutes.usersEdit, usersEditPostController);
dashboardRouter.get(dashboardRoutes.usersEdit, usersEditController);
dashboardRouter.get(dashboardRoutes.usersEdit, usersEditController);

dashboardRouter.get("/dashboard/users/:userEmail/delete", userDeleteGetController);
dashboardRouter.post("/dashboard/users/:userEmail/delete", userDeletePostController);

// lists
dashboardRouter.use("/dashboard/lists", listRouter);

dashboardRouter.get(dashboardRoutes.feedback, ensureUserIsAdministrator, addUrlToSession, feedbackController);
