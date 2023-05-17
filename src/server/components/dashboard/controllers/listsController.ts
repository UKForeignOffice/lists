import type { NextFunction, Request, Response } from "express";
import { authRoutes } from "server/components/auth";
import { pageTitles } from "server/components/dashboard/helpers";
import { dashboardRoutes } from "server/components/dashboard/routes";
import { getCSRFToken } from "server/components/cookies/helpers";
import { countriesList } from "server/services/metadata";
import { ServiceType } from "server/models/types";
import { calculateDashboardBoxes, calculateSortOrder, tableHeaders } from "./listsController.helpers";

export const DEFAULT_VIEW_PROPS = {
  dashboardRoutes,
  countriesList,
  ServiceType,
};
export async function listsController(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.isUnauthenticated()) {
      res.redirect(authRoutes.logout);
      return;
    }

    const orderBy = calculateSortOrder(req.query);
    const lists = (await req.user?.getLists(orderBy)) ?? [];

    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.lists],
      req,
      isNewUser: lists.length === 0,
      tableHeaders: tableHeaders(req.query),
      lists,
      csrfToken: getCSRFToken(req),
      dashboardBoxes: calculateDashboardBoxes(lists),
    });
  } catch (error) {
    next(error);
  }
}
