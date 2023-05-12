import { ListsForDashboard, Prisma } from "@prisma/client";
import pluralize from "pluralize";
import { NextFunction, Request, Response } from "express";
import { authRoutes } from "server/components/auth";
import { pageTitles } from "server/components/dashboard/helpers";
import { dashboardRoutes } from "server/components/dashboard/routes";
import { getCSRFToken } from "server/components/cookies/helpers";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import Joi from "joi";
import { logger } from "server/services/logger";

type DashboardOrderByInput = Omit<Prisma.ListsForDashboardOrderByWithRelationInput, "listId" | "jsonData">;

export async function listsController(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.isUnauthenticated()) {
      return res.redirect(authRoutes.logout);
    }

    const { value, error } = sanitiseQuery(req.query);
    if (error) {
      logger.info(`${req.originalUrl}, query was invalid. ${error.message}`);
      res.redirect(new URL(req.originalUrl).pathname);
      return;
    }
    const orderBy = calculateSortOrder(value);

    const lists = (await req.user?.getLists(orderBy)) ?? [];
    const isNewUser = !req.user?.isAdministrator && lists?.length === 0;

    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.lists],
      req,
      isNewUser,
      lists,
      csrfToken: getCSRFToken(req),
      dashboardBoxes: calculateDashboardBoxes(lists),
    });
  } catch (error) {
    next(error);
  }
}

function sanitiseQuery(query: Request["query"]) {
  const sortString = Joi.string().allow("asc", "desc").lowercase();
  const schema = Joi.object<DashboardOrderByInput>({
    actionNeeded: sortString,
    admins: sortString,
    country: sortString,
    isOverdue: sortString,
    lastAnnualReviewStartDate: sortString,
    live: sortString,
    nextAnnualReviewStartDate: sortString,
    type: sortString,
  });
  return schema.validate(query, {
    stripUnknown: true,
    convert: true,
  });
}
export function calculateSortOrder(
  queryParamSortOrder: Prisma.ListsForDashboardOrderByWithRelationInput
): Array<Record<string, string>> {
  const defaultSortOrder = {
    country: "asc",
    type: "asc",
  };

  const sortOrder = {
    ...defaultSortOrder,
    ...queryParamSortOrder,
  };

  return Object.entries(sortOrder).map(convertEntryToObject);
}

function convertEntryToObject([key, value]: [string, string]) {
  return { [key]: value };
}

function calculateDashboardBoxes(lists: ListsForDashboard[]) {
  return {
    administrators: calculateAdminDashboardBox(lists),
  };
}

function calculateAdminDashboardBox(lists: ListsForDashboard[]) {
  const adminBox = {
    name: "administrators",
    queryParam: "admins",
    text: "All lists have administrators",
    status: "success",
  };

  const { length: listsWithNoAdmins } = lists.filter((list) => list.admins === 0);

  if (listsWithNoAdmins > 0) {
    adminBox.text = `${pluralize("list", listsWithNoAdmins, true)} ${pluralize(
      "have",
      listsWithNoAdmins
    )} no administrators`;
    adminBox.status = "error";
  }

  return adminBox;
}
