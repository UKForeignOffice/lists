import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { userIsListPublisher } from "server/components/dashboard/helpers";

import type { NextFunction, Request, Response } from "express";
import type { List } from "server/models/types";
import { ListItemGetObject } from "server/models/types";
import { HttpException } from "server/middlewares/error-handlers";
import { ListItemConfirmationPages, ListItemUrls } from "server/components/dashboard/listsItems/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { dashboardRoutes } from "server/components/dashboard";

export async function redirectIfUnauthorised(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId: stringListId } = req.params;

    const listId = Number(stringListId);

    if(!Number(listId)) {
      throw new Error("listId is not a number");
    }

    const userCanPublishList = req.user?.isListPublisher(listId) ?? false;

    if (!userCanPublishList) {
      const err = new HttpException(403, "403", "User is not authorised to access this list.");
      return next(err);
    }

    next();
  } catch (error) {
    logger.error(`redirectIfUnauthorised Error: ${(error as Error).message}`);
    const err = new HttpException(403, "403", "Unable to validate this request Please try again.");
    return next(err);
  }
}

export function getConfirmationPages(listItemUrls: ListItemUrls): ListItemConfirmationPages {
  return {
    publish: {
      path: "dashboard/list-item-confirm-publish",
      postActionPageUrl: listItemUrls.listItemPublish,
    },
    unpublish: {
      path: "dashboard/list-item-confirm-unpublish",
      postActionPageUrl: listItemUrls.listItemPublish,
    },
    requestChanges: {
      path: "dashboard/list-item-confirm-changes",
      postActionPageUrl: listItemUrls.listItemRequestChanges,
    },
    updateLive: {
      path: "dashboard/list-item-confirm-update",
      postActionPageUrl: listItemUrls.listItemUpdate,
    },
    updateNew: {
      path: "dashboard/list-item-confirm-publish",
      postActionPageUrl: listItemUrls.listItemUpdate,
    },
    pin: {
      path: "dashboard/list-item-confirm-pin",
      postActionPageUrl: listItemUrls.listItemPin,
    },
    unpin: {
      path: "dashboard/list-item-confirm-pin",
      postActionPageUrl: listItemUrls.listItemPin,
    },
    remove: {
      path: "dashboard/list-item-confirm-remove",
      postActionPageUrl: listItemUrls.listItemDelete,
    },
  };
}

export function mapUpdatedAuditJsonDataToListItem(
  listItem: ListItemGetObject,
  updatedJsonData: ListItemJsonData
): ListItemJsonData {
  return Object.assign(
    {},
    listItem.jsonData,
    ...Object.keys(listItem.jsonData).map((k) => k in updatedJsonData && { [k]: updatedJsonData[k] })
  );
}

export function getListItemUrls(req: Request): ListItemUrls {
  const { listId, listItemId } = req.params;

  if (!Number.isInteger(Number(listItemId))) throw new Error("listItemId is not a number");

  return {
    listIndex: dashboardRoutes.listsItems.replace(":listId", listId),
    listItem: dashboardRoutes.listsItem.replace(":listId", listId).replace(":listItemId", listItemId),
    listItemPublish: dashboardRoutes.listsItemPublish.replace(":listId", listId).replace(":listItemId", listItemId),
    listItemUpdate: dashboardRoutes.listsItemUpdate.replace(":listId", listId).replace(":listItemId", listItemId),
    listItemRequestChanges: dashboardRoutes.listsItemRequestChanges
      .replace(":listId", listId)
      .replace(":listItemId", listItemId),
    listItemDelete: dashboardRoutes.listsItemDelete.replace(":listId", listId).replace(":listItemId", listItemId),
    listItemPin: dashboardRoutes.listsItemDelete.replace(":listId", listId).replace(":listItemId", listItemId),
  };
}
