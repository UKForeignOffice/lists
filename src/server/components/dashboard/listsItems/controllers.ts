// TODO: Ideally all of the checks in the controller should be split off into reusable middleware rather then repeating in each controller
import type { NextFunction, Request, Response } from "express";
import { EventJsonData, ListItem, ListItemGetObject } from "server/models/types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { Prisma, Status } from "@prisma/client";
import { findListById, updateList } from "server/models/list";
import { HttpException } from "server/middlewares/error-handlers";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import { getDetailsViewModel } from "./getViewModel";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import type { ListIndexRes, ListItemRes } from "server/components/dashboard/listsItems/types";
import { serviceTypeDetailsHeading } from "server/components/dashboard/listsItems/helpers";
import { getActivityStatus, getPublishingStatus } from "server/models/listItem/summary.helpers";
import { isEmpty } from "lodash";
import { actionHandlers } from "server/components/dashboard/listsItems/item/update/actionHandlers";
import { Action } from "server/components/dashboard/listsItems/item/update/types";
import { logger } from "server/services/logger";

function mapUpdatedAuditJsonDataToListItem(
  listItem: ListItemGetObject | ListItem,
  updatedJsonData: ListItemJsonData
): ListItemJsonData {
  /**
   * Cherry-picked from origin/feat/1541-sworn-list-fix
   */
  const swornTranslatorFields =
    listItem.type === "translatorsInterpreters" ? ["swornInterpretations", "swornTranslations"] : [];
  const jsonData = (listItem as ListItemGetObject).jsonData;

  return Object.assign(
    {},
    listItem.jsonData,
    ...[...Object.keys(jsonData), ...swornTranslatorFields].map(
      (k) => updatedJsonData?.[k] && { [k]: updatedJsonData[k] }
    )
  );
}

export async function listItemGetController(req: Request, res: ListItemRes): Promise<void> {
  let error;
  const errorMsg = req.flash("errorMsg");

  req.session.update = {};

  // @ts-expect-error
  if (errorMsg?.length > 0) {
    error = {
      text: errorMsg,
    };
  }
  const list = res.locals.list!;
  const listItem = res.locals.listItem;
  const userId = req.user?.userData.id;
  let requestedChanges;

  const hasPendingUpdate = listItem.status === Status.EDITED;

  // @ts-ignore
  const isLegacyUpdate = hasPendingUpdate && !listItem.jsonData?.updatedJsonData;

  // @ts-ignore
  let updatedJsonData = listItem.jsonData?.updatedJsonData;

  if (hasPendingUpdate && isLegacyUpdate) {
    logger.info(`rendering ${listItem.id} with legacy update`);
    const auditForEdits = listItem?.history?.find?.((event) => event.type === "EDITED");
    const auditJsonData: EventJsonData = auditForEdits?.jsonData as EventJsonData;
    updatedJsonData = auditJsonData?.updatedJsonData;
    listItem.jsonData = mapUpdatedAuditJsonDataToListItem(listItem, updatedJsonData);
  }

  if (listItem.status === "EDITED" || listItem.status === "OUT_WITH_PROVIDER") {
    const eventForRequestedChanges = listItem?.history?.find((event) => event.type === "OUT_WITH_PROVIDER");
    const jsonData = eventForRequestedChanges?.jsonData as Prisma.JsonObject;
    requestedChanges = jsonData?.requestedChanges;
  }

  const actionButtons: Record<Status, string[]> = {
    NEW: ["publish", "request-changes", "remove", "archive"],
    OUT_WITH_PROVIDER: ["publish", "request-changes", "remove", "archive"],
    EDITED: [listItem.isPublished ? "update-live" : "update-new", "request-changes", "remove", "archive"],
    PUBLISHED: ["request-changes", "unpublish", "remove"],
    UNPUBLISHED: ["publish", "request-changes", "remove", "archive"],
    CHECK_ANNUAL_REVIEW: ["update-live", "request-changes", "unpublish", "remove", "archive"],
    ANNUAL_REVIEW_OVERDUE: ["unpublish", "remove", "archive"],
  };

  const isPinned = listItem?.pinnedBy?.some((user) => userId === user.id) ?? false;
  const actionButtonsForStatus = actionButtons[listItem.status];

  res.render("dashboard/lists-item", {
    ...DEFAULT_VIEW_PROPS,
    list,
    req,
    listItem: {
      ...listItem,
      activityStatus: getActivityStatus(listItem),
      publishingStatus: getPublishingStatus(listItem),
    },
    annualReview: {
      providerResponded: listItem.status === Status.CHECK_ANNUAL_REVIEW,
      fieldsUpdated: !isEmpty((listItem.jsonData as ListItemJsonData).updatedJsonData),
    },
    isPinned,
    actionButtons: actionButtonsForStatus,
    requestedChanges,
    error,
    title: serviceTypeDetailsHeading[listItem.type] ?? "Provider",
    details: getDetailsViewModel(listItem),
    csrfToken: getCSRFToken(req),
  });
}

export async function listItemPostController(req: Request, res: Response, next: NextFunction) {
  const { message, action } = req.body;
  const skipConfirmation = req.body?.["skip-confirmation"] ?? false;

  const { listItemUrl } = res.locals;

  if (!action) {
    req.flash("errorMsg", "You must select an action");
    return res.redirect(listItemUrl);
  }

  if (action === "requestChanges" && !message) {
    req.flash("errorMsg", "You must provide a message to request a change");
    return res.redirect(listItemUrl);
  }

  req.session.update = {
    action,
    message,
  };

  const allowedSkipConfirmationActions = ["pin", "unpin"];

  if (skipConfirmation && allowedSkipConfirmationActions.includes(action)) {
    return actionHandlers[action as Action](req, res, next);
  }

  return res.redirect(`${listItemUrl}/confirm`);
}

export async function listPublisherDelete(req: Request, res: ListIndexRes, next: NextFunction): Promise<void> {
  const userEmail = req.body.userEmail;
  const listId = res.locals.list?.id as number;
  const list = await findListById(listId);
  const userHasRemovedOwnEmail = userEmail === req.user?.userData.email;

  if (!list) {
    // TODO: this should never happen. findByListId should probably throw.
    const err = new HttpException(404, "404", "List could not be found.");
    return next(err);
  }

  if (userHasRemovedOwnEmail) {
    const error = {
      field: "publisherList",
      text: "You cannot remove yourself as a user. Contact an administrator to remove your email address from this list.",
      href: "#publishers",
    };

    return res.render("dashboard/list-edit-confirm-delete-user", {
      ...DEFAULT_VIEW_PROPS,
      listId: list.id,
      userEmail,
      error,
      list,
      req,
      csrfToken: getCSRFToken(req),
    });
  }

  const updatedUsers = list.jsonData?.users?.filter((u) => u !== userEmail) ?? [];

  await updateList(list.id, { users: updatedUsers });

  req.flash("successBannerHeading", "Success");
  req.flash("successBannerMessage", `User ${userEmail} has been removed`);

  return res.redirect(res.locals.listsEditUrl);
}
