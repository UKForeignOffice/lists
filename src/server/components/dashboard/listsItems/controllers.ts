// TODO: Ideally all of the checks in the controller should be split off into reusable middleware rather then repeating in each controller
import type { NextFunction, Request, Response } from "express";
import type { EventJsonData, ListItem, ListItemGetObject } from "server/models/types";
import type { Prisma } from "@prisma/client";
import { Status } from "@prisma/client";
import { findListById, updateList } from "server/models/list";
import { HttpException } from "server/middlewares/error-handlers";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers/controllers";
import { getDetailsViewModel } from "./getViewModel";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import type { ListIndexRes, ListItemRes } from "server/components/dashboard/listsItems/types";
import { serviceTypeDetailsHeading } from "server/components/dashboard/listsItems/helpers";
import { getActivityStatus, getPublishingStatus } from "server/models/listItem/summary.helpers";
import { isEmpty } from "lodash";
import { actionHandlers } from "server/components/dashboard/listsItems/item/update/actionHandlers";
import type { Action } from "server/components/dashboard/listsItems/item/update/types";
import { logger } from "server/services/logger";
import { createEditDetailsURL } from "./item/update/actionHandlers/editDetails";

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

  if (req.session.currentlyEditing === Number(req.params.listItemId)) {
    delete req.session.currentlyEditing;
    req.flash("providerUpdatedTitle", "Provider details updated");
    req.flash(
      "providerUpdatedMessage",
      "The provider’s details have been updated. The provider has been emailed to let them know."
    );
  }

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

  const publishingStatus = getPublishingStatus(listItem);

  const hasResponded = ["EDITED", "CHECK_ANNUAL_REVIEW"].includes(listItem.status);

  const actions: Record<Action, boolean> = {
    archive: !listItem.isPublished && !["archived", "unpublished"].includes(publishingStatus),
    pin: false, // never show this radio
    remove: listItem.status === "UNPUBLISHED" || publishingStatus === "archived",
    requestChanges: !["OUT_WITH_PROVIDER", "ANNUAL_REVIEW_OVERDUE"].includes(listItem.status),
    editDetails: !["OUT_WITH_PROVIDER", "ANNUAL_REVIEW_OVERDUE"].includes(listItem.status),
    unpin: false, // never show this radio
    unpublish: listItem.isPublished,
    update: false, // never show this radio
    updateLive: listItem.isPublished && hasResponded,
    updateNew: !listItem.isPublished && hasResponded,
    publish: !listItem.isPublished && listItem.status !== "EDITED",
  };

  // @ts-ignore
  const actionButtons = Object.keys(actions).filter((action) => actions[action]);
  logger.info(`action buttons ${listItem.id} ${JSON.stringify(actionButtons)}`);
  const isPinned = listItem?.pinnedBy?.some((user) => userId === user.id) ?? false;

  res.render("dashboard/lists-item", {
    ...DEFAULT_VIEW_PROPS,
    list,
    req,
    listItem: {
      ...listItem,
      activityStatus: getActivityStatus(listItem),
      publishingStatus,
    },
    annualReview: {
      providerResponded: listItem.status === Status.CHECK_ANNUAL_REVIEW,
      fieldsUpdated: !isEmpty((listItem.jsonData as ListItemJsonData).updatedJsonData),
    },
    isPinned,
    actionButtons,
    requestedChanges,
    error,
    title: serviceTypeDetailsHeading[listItem.type] ?? "Provider",
    details: getDetailsViewModel(listItem),
  });
}

export async function listItemPostController(req: Request, res: Response, next: NextFunction) {
  const { action } = req.body;
  const message = req.body.message || req.body.reason;
  const skipConfirmation = req.body?.["skip-confirmation"] ?? false;

  const { listItemUrl } = res.locals;

  if (!action) {
    req.flash("errorMsg", "You must select an action");
    res.redirect(listItemUrl);
    return;
  }

  if (action === "requestChanges" && !message) {
    req.flash("errorMsg", "You must provide a message to request a change");
    res.redirect(listItemUrl);
    return;
  }

  if (action === "editDetails" && !req.body.editMessage) {
    req.flash("errorMsg", "You must provide a message to edit provider details");
    res.redirect(listItemUrl);
    return;
  }

  req.session.update = {
    action,
    message,
  };

  const allowedSkipConfirmationActions = ["pin", "unpin"];

  if (skipConfirmation && allowedSkipConfirmationActions.includes(action)) {
    actionHandlers[action as Action](req, res, next);
    return;
  }

  if (action === "editDetails") {
    const editDetailsUrl = await createEditDetailsURL({
      listItem: res.locals.listItem,
      message: req.body.editMessage,
      userId: req.user?.id as number,
      isAnnualReview: res.locals.listItem.isAnnualReview,
    });

    if ("error" in editDetailsUrl) {
      next(editDetailsUrl.error);
      return;
    }

    req.session.currentlyEditing = res.locals.listItem.id;
    res.redirect(editDetailsUrl.result);
    return;
  }

  res.redirect(`${listItemUrl}/confirm`);
}

export async function listPublisherDelete(req: Request, res: ListIndexRes, next: NextFunction): Promise<void> {
  const userEmail = req.body.userEmail;
  const listId = res.locals.list?.id as number;
  const list = await findListById(listId);
  const userHasRemovedOwnEmail = userEmail === req.user?.userData.email;

  if (!list) {
    // TODO: this should never happen. findByListId should probably throw.
    logger.error("listPublisherDelete: list could not be found");
    const err = new HttpException(404, "404", "List could not be found.");
    next(err);
    return;
  }

  if (userHasRemovedOwnEmail) {
    const error = {
      field: "publisherList",
      text: "You cannot remove yourself as a user. Contact an administrator to remove your email address from this list.",
      href: "#publishers",
    };

    res.render("dashboard/list-edit-confirm-delete-user", {
      ...DEFAULT_VIEW_PROPS,
      listId: list.id,
      userEmail,
      error,
      list,
      req,
    });
    return;
  }

  const { jsonData = {} } = list;

  const updatedUsers = jsonData.users?.filter((u) => u !== userEmail) ?? [];

  await updateList(list.id, { ...jsonData, users: updatedUsers });

  req.flash("successBannerHeading", "Success");
  req.flash("successBannerMessage", `User ${userEmail} has been removed`);

  res.redirect(res.locals.listsEditUrl);
}
