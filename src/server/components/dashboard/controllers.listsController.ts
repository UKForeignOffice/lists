import type { ListsForDashboard, Prisma } from "@prisma/client";
import pluralize from "pluralize";
import type { NextFunction, Request, Response } from "express";
import { authRoutes } from "server/components/auth";
import { pageTitles } from "server/components/dashboard/helpers";
import { dashboardRoutes } from "server/components/dashboard/routes";
import { getCSRFToken } from "server/components/cookies/helpers";
import Joi from "joi";
import { countriesList } from "server/services/metadata";
import { ServiceType } from "server/models/types";

type DashboardOrderByInput = Omit<Prisma.ListsForDashboardOrderByWithRelationInput, "listId" | "jsonData">;
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
    const isNewUser = !req.user?.isAdministrator && lists?.length === 0;
    res.render("dashboard/lists", {
      ...DEFAULT_VIEW_PROPS,
      title: pageTitles[dashboardRoutes.lists],
      req,
      isNewUser,
      tableHeaders: tableHeaders(req.query),
      lists,
      csrfToken: getCSRFToken(req),
      dashboardBoxes: calculateDashboardBoxes(lists),
    });
  } catch (error) {
    next(error);
  }
}

function tableHeaders(query) {
  const headers: Array<keyof Prisma.ListsForDashboardOrderByWithRelationInput> = [
    "type",
    "country",
    "live",
    "actionNeeded",
    "lastAnnualReviewStartDate",
    "nextAnnualReviewStartDate",
    "admins",
    "listId",
  ];

  const { value: orderBy } = sanitiseQuery(query);

  return headers.map((cell) => {
    // @ts-ignore
    const currentlySortedBy = orderBy[cell] ?? "none";

    let nextSortButton;

    if (currentlySortedBy === "asc") {
      nextSortButton = "desc";
    }

    if (currentlySortedBy === "none") {
      nextSortButton = "asc";
    }

    return {
      name: cell,
      currentlySortedBy,
      nextSortButton,
    };
  });
}

function sanitiseQuery(query: Request["query"]) {
  const sortString = Joi.string().allow("asc", "desc").lowercase();
  const stringSchema = Joi.alternatives().try(sortString, Joi.any().strip());
  const schema = Joi.object<DashboardOrderByInput>({
    actionNeeded: stringSchema,
    admins: stringSchema,
    country: stringSchema,
    isOverdue: stringSchema,
    lastAnnualReviewStartDate: stringSchema,
    live: stringSchema,
    nextAnnualReviewStartDate: stringSchema,
    type: stringSchema,
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

  const { value: sanitisedQueryParams } = sanitiseQuery(queryParamSortOrder);

  const sortOrder = {
    ...defaultSortOrder,
    ...sanitisedQueryParams,
  };

  return Object.entries(sortOrder).map(convertEntryToObject);
}

function convertEntryToObject([key, value]: [string, string]) {
  return { [key]: value };
}

function calculateDashboardBoxes(lists: ListsForDashboard[]) {
  return {
    administrators: calculateAdminDashboardBox(lists),
    serviceProviders: calculateProvidersDashboardBox(lists),
    reviews: calculateReviewsDashboardBox(lists),
  };
}

function calculateAdminDashboardBox(lists: ListsForDashboard[]) {
  const adminBox = {
    name: "Administrators",
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

function calculateProvidersDashboardBox(lists: ListsForDashboard[]) {
  const reviewsBox = {
    name: "Service providers",
    queryParam: "live",
    text: "All lists have live providers",
    status: "success",
  };

  const { length: liveServiceProviders } = lists.filter((list) => list.live === 0);

  if (liveServiceProviders > 0) {
    reviewsBox.text = `${pluralize("list", liveServiceProviders, true)} ${pluralize(
      "have",
      liveServiceProviders
    )} no live ${pluralize("providers", liveServiceProviders)}`;
    reviewsBox.status = "error";
  }

  return reviewsBox;
}

function calculateReviewsDashboardBox(lists: ListsForDashboard[]) {
  const reviewsBox = {
    name: "Reviews",
    queryParam: "isOverdue",
    text: "All lists reviewed within the past 18 months",
    status: "success",
  };

  const { length: listsOverdue } = lists.filter((list) => list.isOverdue);

  if (listsOverdue > 0) {
    reviewsBox.text = `${pluralize("list", listsOverdue, true)} overdue by 6+ months`;
    reviewsBox.status = "error";
  }

  return reviewsBox;
}
