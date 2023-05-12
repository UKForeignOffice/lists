import { ListsForDashboard, Prisma } from "@prisma/client";
import pluralize from "pluralize";
import { NextFunction, Request, Response } from "express";
import { authRoutes } from "server/components/auth";
import { pageTitles } from "server/components/dashboard/helpers";
import { dashboardRoutes } from "server/components/dashboard/routes";
import { getCSRFToken } from "server/components/cookies/helpers";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";

export async function listsController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.isUnauthenticated()) {
      return res.redirect(authRoutes.logout);
    }
    // TODO: Object.hasOwn is recommended but is not currently supported by tsc.
    // eslint-disable-next-line no-prototype-builtins
    const orderBy = calculateSortOrder(req.query);

    const lists = await req.user?.getLists(orderBy);
    const isNewUser = !req.user?.isAdministrator && lists?.length === 0;

    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.lists],
      req,
      isNewUser,
      lists,
      csrfToken: getCSRFToken(req),
      dashboardBoxes: calculateDashboardBoxes(lists as ListsForDashboard[], !req.user?.isAdministrator),
    });
  } catch (error) {
    next(error);
  }
}

export function calculateSortOrder(
  queryParamSortOrder: Prisma.ListsForDashboardOrderByWithRelationInput
): Array<Record<string, string>> {
  const defaultSortOrder = {
    country: "asc",
    type: "asc",
  };

  // TODO: Object.hasOwn is recommended but is not currently supported by tsc.
  // eslint-disable-next-line no-prototype-builtins
  if (!queryParamSortOrder.hasOwnProperty("admins")) {
    return Object.entries(defaultSortOrder).map(convertEntryToObject);
  }

  const newSortOrder = {
    ...queryParamSortOrder,
    ...defaultSortOrder,
  };

  return Object.entries(newSortOrder).map(convertEntryToObject);
}

function convertEntryToObject([key, value]: [string, string]) {
  return { [key]: value === "desc" ? "desc" : "asc" };
}

function calculateDashboardBoxes(lists: ListsForDashboard[], userIsAdmin: boolean) {
  if (userIsAdmin) return [];

  return [calculateAdminDashboardBox(lists)];
}

function calculateAdminDashboardBox(lists: ListsForDashboard[]) {
  const adminBox = {
    name: "administrators",
    queryParam: "admins",
    text: "All lists have administrators",
    cssClass: "success",
  };

  const { length: listsWithNoAdmins } = lists.filter((list) => list.admins === 0);

  if (listsWithNoAdmins > 0) {
    adminBox.text = `${pluralize("list", listsWithNoAdmins, true)} ${pluralize(
      "have",
      listsWithNoAdmins
    )} no administrators`;
    adminBox.cssClass = "error";
  }

  return adminBox;
}
