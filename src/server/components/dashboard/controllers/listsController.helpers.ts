import type { Request } from "express";
import Joi from "joi";
import type { ListsForDashboard, Prisma } from "@prisma/client";
import pluralize from "pluralize";

type DashboardOrderByInput = Omit<Prisma.ListsForDashboardOrderByWithRelationInput, "listId" | "jsonData">;

export function tableHeaders(query: Request["query"]) {
  const headers: Array<keyof DashboardOrderByInput> = [
    "type",
    "country",
    "live",
    "actionNeeded",
    "lastAnnualReviewStartDate",
    "nextAnnualReviewStartDate",
    "admins",
  ];

  const { value: orderBy } = sanitiseQuery(query);

  return headers.map((cell) => {
    // @ts-ignore
    const currentlySortedBy = orderBy[cell] ?? "none";

    return {
      name: cell,
      currentlySortedBy,
    };
  });
}

export function sanitiseQuery(query: Request["query"]) {
  const sortString = Joi.string().valid("asc", "desc");
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
): Prisma.ListsForDashboardFindManyArgs["orderBy"] {
  const defaultSortOrder: Pick<Prisma.ListsForDashboardOrderByWithRelationInput, "country" | "type"> = {
    country: "asc",
    type: "asc",
  };

  const { value: sanitisedQueryParams = {} } = sanitiseQuery(queryParamSortOrder);

  if (sanitisedQueryParams.type) {
    delete defaultSortOrder.type;
  }

  if (sanitisedQueryParams.country) {
    delete defaultSortOrder.country;
  }

  const sortOrder = {
    ...sanitisedQueryParams,
    ...defaultSortOrder,
  };

  return Object.entries(sortOrder).map(convertEntryToObject);
}

const DATE_KEYS = ["lastAnnualReviewStartDate", "nextAnnualReviewStartDate"];
export function convertEntryToObject([key, value]: [string, Prisma.SortOrder | Prisma.SortOrderInput]) {
  if (DATE_KEYS.includes(key)) {
    return {
      [key]: {
        sort: value,
        nulls: value === "asc" ? "first" : "last",
      },
    };
  }
  return { [key]: value };
}

export function calculateDashboardBoxes(lists: ListsForDashboard[]) {
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
