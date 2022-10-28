// TODO: Ideally all of the checks in the controller should be split off into reusable middleware rather then repeating in each controller
import { NextFunction, Request, Response } from "express";
import { findListById } from "server/models/list";
import { deleteListItem, findListItemById, togglerListItemIsPublished, update } from "server/models/listItem/listItem";
import { authRoutes } from "server/components/auth";
import { getInitiateFormRunnerSessionToken, userIsListPublisher } from "server/components/dashboard/helpers";
import {
  BaseListItemGetObject,
  EventJsonData,
  List,
  ListItem,
  ListItemGetObject,
  ServiceType,
  User,
} from "server/models/types";
import { dashboardRoutes } from "server/components/dashboard";
import { getCSRFToken } from "server/components/cookies/helpers";
import { AuditEvent, ListItemEvent, Status } from "@prisma/client";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "server/models/audit";
import { logger } from "server/services/logger";
import { generateFormRunnerWebhookData, getNewSessionWebhookData } from "server/components/formRunner/helpers";
import {
  createFormRunnerEditListItemLink,
  createFormRunnerReturningUserLink,
  createListSearchBaseLink,
} from "server/components/lists/helpers";
import { getChangedAddressFields, getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendDataPublishedEmail, sendEditDetailsEmail } from "server/services/govuk-notify";
import { UpdatableAddressFields } from "server/models/listItem/providers/types";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";

import { recordEvent } from "server/models/listItem/listItemEvent";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { getDetailsViewModel } from "./getViewModel";
import { HttpException } from "server/middlewares/error-handlers";
import { ListItemConfirmationPages, ListItemUrls } from "server/components/dashboard/listsItems/types";
import {
  getConfirmationPages,
  getListItemUrls,
  mapUpdatedAuditJsonDataToListItem,
} from "server/components/dashboard/listsItems/helpers";

const serviceTypeDetailsHeading: Record<ServiceType, string> = {
  covidTestProviders: "Covid test provider",
  funeralDirectors: "Funeral director",
  lawyers: "Lawyer",
  translatorsInterpreters: "Translator or interpreter",
};

export async function listItemGetController(req: Request, res: Response): Promise<void> {
  const { listId, listItemId } = req.params;
  const userId = req?.user?.userData?.id;
  let error;
  const errorMsg = req.flash("errorMsg");

  // @ts-expect-error
  if (errorMsg?.length > 0) {
    error = {
      text: errorMsg,
    };
  }
  const list = await findListById(listId);
  const listItem: ListItemGetObject = await findListItemById(listItemId);
  let requestedChanges;

  if (listItem.status === Status.EDITED) {
    const auditForEdits = listItem?.history
      ?.filter((event) => event.type === "EDITED")
      .sort((a, b) => a.id - b.id)
      .pop();

    const auditJsonData: EventJsonData = auditForEdits?.jsonData as EventJsonData;
    const updatedJsonData = auditJsonData?.updatedJsonData;
    if (updatedJsonData !== undefined) {
      listItem.jsonData = mapUpdatedAuditJsonDataToListItem(listItem, updatedJsonData);
      const updatedAddressFields: UpdatableAddressFields = getChangedAddressFields(updatedJsonData, listItem.address);
      // @ts-ignore
      listItem.address = {
        ...listItem.address,
        ...updatedAddressFields,
      };
    }
  }

  if (listItem.status === "EDITED" || listItem.status === "OUT_WITH_PROVIDER") {
    const eventForRequestedChanges = listItem?.history
      ?.filter((event) => event.type === "OUT_WITH_PROVIDER")
      .sort((a, b) => a.id - b.id)
      .pop();

    requestedChanges = eventForRequestedChanges?.jsonData?.requestedChanges;
  }

  const actionButtons: Record<string, string[]> = {
    NEW: ["publish", "request-changes", "remove"],
    OUT_WITH_PROVIDER: ["publish", "request-changes", "remove"],
    EDITED: [listItem.isPublished ? "update-live" : "update-new", "request-changes", "remove"],
    // ANNUAL_REVIEW: ["update", "request-changes", "remove"],
    // REVIEW_OVERDUE: ["update", "request-changes", "remove"],
    // REVIEWED: ["update", "request-changes", "remove"],
    PUBLISHED: ["unpublish", "remove"],
    UNPUBLISHED: ["publish", "request-changes", "remove"],
  };

  const isPinned = listItem?.pinnedBy?.some((user) => userId === user.id) ?? false;
  const actionButtonsForStatus = actionButtons[listItem.status];

  res.render("dashboard/lists-item", {
    ...DEFAULT_VIEW_PROPS,
    changeMessage: req.session?.changeMessage,
    list,
    listItem,
    isPinned,
    actionButtons: actionButtonsForStatus,
    requestedChanges,
    error,
    title: serviceTypeDetailsHeading[listItem.type] ?? "Provider",
    details: getDetailsViewModel(listItem),
    csrfToken: getCSRFToken(req),
  });
}

export async function listItemPostController(req: Request, res: Response): Promise<void> {
  const { listId, listItemId } = req.params;
  const { message, action }: { message: string; action: keyof ListItemConfirmationPages } = req.body;

  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const listItemUrls: ListItemUrls = getListItemUrls(req);
    const list = ((await findListById(listId)) ?? {}) as List;
    const listItem: ListItemGetObject = await findListItemById(listItemId);
    const listJson: ListItemJsonData = listItem.jsonData;
    listJson.country = list?.country?.name ?? "";
    const confirmationPages: ListItemConfirmationPages = getConfirmationPages(listItemUrls);
    const confirmationPage = confirmationPages[action];

    if (!action) {
      req.flash("errorMsg", "You must select an action");
      return res.redirect(listItemUrls.listItem);
    }

    if (action === "requestChanges") {
      if (!message) {
        req.flash("errorMsg", "You must provide a message to request a change");
        return res.redirect(listItemUrls.listItem);
      }

      req.session.changeMessage = message;
    }

    res.render(confirmationPage.path, {
      ...DEFAULT_VIEW_PROPS,
      list,
      listItem,
      message,
      action,
      req,
      postActionPageUrl: confirmationPage.postActionPageUrl,
      csrfToken: getCSRFToken(req),
    });
  } catch (error) {
    logger.error(`listItemPostController Error: ${(error as Error).message}`);
  }
}

export async function listItemPinController(req: Request, res: Response): Promise<void> {
  const { listId, listItemId } = req.params;
  const { action } = req.body;
  const userId = req?.user?.userData?.id;
  const isPinned = action === "pin";
  const listItem: ListItemGetObject = (await findListItemById(listItemId)) as ListItemGetObject;

  try {
    const { listItem: listItemUrl, listIndex } = getListItemUrls(req);

    if (userId === undefined) {
      req.flash("errorMsg", "Unable to perform action - user could not be identified");
      return res.redirect(listItemUrl);
    }
    await handlePinListItem(Number(listItemId), userId, isPinned);

    req.flash(
      "successBannerTitle",
      `${listItem.jsonData.organisationName} has been ${isPinned ? "pinned" : "unpinned"}`
    );
    req.flash("successBannerHeading", `${isPinned ? "Pinned" : "Unpinned"}`);
    req.flash("successBannerColour", "blue");
    res.redirect(listIndex);
  } catch (error) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${(error as Error).message}`);
    return res.redirect(dashboardRoutes.listsItem.replace(":listId", listId).replace(":listItemId", listItemId));
  }
}

export async function handlePinListItem(id: number, userId: User["id"], isPinned: boolean): Promise<ListItem> {
  if (userId === undefined) {
    throw new Error("deleteListItem Error: userId is undefined");
  }

  try {
    let listItem;
    if (isPinned) {
      [listItem] = await prisma.$transaction([
        prisma.listItem.update({
          where: {
            id,
          },
          data: {
            pinnedBy: {
              connect: [{ id: userId }],
            },
          },
        }),
        recordListItemEvent(
          {
            eventName: "pin",
            itemId: id,
            userId,
          },
          AuditEvent.PINNED
        ),
        recordEvent(
          {
            eventName: "pin",
            itemId: id,
            userId,
          },
          id,
          ListItemEvent.PINNED
        ),
      ]);
    } else {
      [listItem] = await prisma.$transaction([
        prisma.listItem.update({
          where: {
            id,
          },
          data: {
            pinnedBy: {
              disconnect: [{ id: userId }],
            },
          },
        }),
        recordListItemEvent(
          {
            eventName: "unpin",
            itemId: id,
            userId,
          },
          AuditEvent.UNPINNED
        ),
        recordEvent(
          {
            eventName: "unpin",
            itemId: id,
            userId,
          },
          id,
          ListItemEvent.UNPINNED
        ),
      ]);
    }

    return listItem;
  } catch (e: any) {
    logger.error(`deleteListItem Error ${e.message}`);

    throw new Error(`Failed to ${isPinned ? "pin" : "unpinned"} item`);
  }
}

export async function listItemDeleteController(req: Request, res: Response): Promise<void> {
  const { listItemId, listId } = req.params;
  const userId = req?.user?.userData?.id;
  const listItem: ListItemGetObject = (await findListItemById(listItemId)) as ListItemGetObject;

  try {
    const { listItem: listItemUrl, listIndex } = getListItemUrls(req);

    if (userId === undefined) {
      req.flash("errorMsg", "Unable to perform action - user could not be identified");
      return res.redirect(listItemUrl);
    }

    await deleteListItem(Number(listItemId), userId);

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been removed`);
    req.flash("successBannerHeading", "Removed");
    req.flash("successBannerColour", "red");
    res.redirect(listIndex);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(dashboardRoutes.listsItem.replace(":listId", listId).replace(":listItemId", listItemId));
  }
}

export async function listItemUpdateController(req: Request, res: Response): Promise<void> {
  const { listId, listItemId } = req.params;
  const listItemIdNumber = Number(listItemId);
  const userId = req?.user?.userData?.id;
  const listItem: ListItemGetObject = await findListItemById(listItemId);

  try {
    const { listItem: listItemUrl } = getListItemUrls(req);
    await handleListItemUpdate(listItemIdNumber, userId!);

    if (userId === undefined) {
      req.flash("errorMsg", "Unable to perform action - user could not be identified");
      return res.redirect(listItemUrl);
    }

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been updated and published`);
    req.flash("successBannerHeading", "Updated and published");
    req.flash("successBannerColour", "green");
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(dashboardRoutes.listsItem.replace(":listId", listId).replace(":listItemId", listItemId));
  }
}

export async function handleListItemUpdate(id: number, userId: User["id"]): Promise<void> {
  const listItem = await prisma.listItem.findUnique({
    where: { id },
    include: {
      history: true,
    },
  });
  if (listItem === undefined) {
    throw new Error(`Unable to store updates - listItem could not be found`);
  }

  const editEvent = listItem?.history
    .filter((event) => event.type === "EDITED")
    .sort((a, b) => a.id - b.id)
    .pop();

  const auditJsonData: EventJsonData = editEvent?.jsonData as EventJsonData;

  if (auditJsonData?.updatedJsonData !== undefined) {
    // @ts-ignore
    await update(id, userId, auditJsonData.updatedJsonData);
  }
}

export async function listItemRequestChangeController(req: Request, res: Response): Promise<void> {
  const { listId, listItemId, underTest } = req.params;
  const isUnderTest = underTest === "true";
  const userId = req?.user?.userData?.id;
  const changeMessage: string = req.session?.changeMessage ?? "";
  const list = ((await findListById(listId)) ?? {}) as List;
  const listItem = await getListItem(listItemId, list);

  try {
    const { listItem: listItemUrl, listIndex } = getListItemUrls(req);

    if (userId === undefined) {
      req.flash("errorMsg", "Unable to perform action - user could not be identified");
      return res.redirect(listItemUrl);
    }

    if (!changeMessage) {
      req.flash("errorMsg", "You must provide a message to request a change");
      return res.redirect(listItemUrl);
    }

    await handleListItemRequestChanges(list, listItem, changeMessage, userId, isUnderTest);

    req.flash("successBannerTitle", `Change request sent to ${listItem.jsonData.organisationName}`);
    req.flash("successBannerHeading", "Requested");
    req.flash("successBannerColour", "blue");
    res.redirect(listIndex);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(dashboardRoutes.listsItem.replace(":listId", listId).replace(":listItemId", listItemId));
  }
}

async function handleListItemRequestChanges(
  list: List,
  listItem: ListItemGetObject,
  message: string,
  userId: User["id"],
  isUnderTest: boolean
): Promise<void> {
  if (userId === undefined) {
    throw new Error("handleListItemRequestChange Error: userId is undefined");
  }
  const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, listItem, message, isUnderTest);

  // Email applicant
  logger.info(`Generated form runner URL [${formRunnerEditUserUrl}], getting list item contact info.`);
  const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);

  logger.info(`Got contact info [${contactName}, ${contactEmailAddress}], getting list item contact info.`);
  const listType = serviceName(list?.type ?? "");

  logger.info(`Got list type [${listType}`);
  await sendEditDetailsEmail(contactName, contactEmailAddress, listType, message, formRunnerEditUserUrl);
  logger.info(`Sent email, updating listItem`);

  const status = Status.OUT_WITH_PROVIDER;
  const auditEvent = AuditEvent.OUT_WITH_PROVIDER;
  const listItemEvent = ListItemEvent.OUT_WITH_PROVIDER;

  try {
    await prisma.$transaction([
      prisma.listItem.update({
        where: { id: listItem.id },
        data: { status, isPublished: false },
        include: {
          address: {
            include: {
              country: true,
            },
          },
        },
      }),
      recordListItemEvent(
        {
          eventName: "requestChange",
          itemId: listItem.id,
          userId,
          requestedChanges: message,
        },
        auditEvent
      ),
      recordEvent(
        {
          eventName: "requestChange",
          itemId: listItem.id,
          userId,
          requestedChanges: message,
        },
        listItem.id,
        listItemEvent
      ),
    ]);
  } catch (error: any) {
    throw new Error(`handleListItemRequestChanges error: could not update listItem: ${error.message}`);
  }
}

export async function listItemPublishController(req: Request, res: Response): Promise<void> {
  const { listId, listItemId } = req.params;
  const { action } = req.body;
  const userId = req?.user?.userData?.id;
  const isPublished = action === "publish";

  const list = ((await findListById(listId)) ?? {}) as List;
  const listItem = await getListItem(listItemId, list);

  try {
    const { listItem: listItemUrl } = getListItemUrls(req);
    if (userId === undefined) {
      req.flash("errorMsg", "Unable to perform action - user could not be identified");
      return res.redirect(listItemUrl);
    }

    await handlePublishListItem(Number(listItemId), isPublished, userId);

    const successBannerHeading = `${action}ed`;
    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been ${successBannerHeading}`);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", "green");
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(dashboardRoutes.listsItem.replace(":listId", listId).replace(":listItemId", listItemId));
  }
}

export async function handlePublishListItem(
  listItemId: number,
  isPublished: boolean,
  userId: User["id"]
): Promise<void> {
  const updatedListItem = await togglerListItemIsPublished({
    id: listItemId,
    isPublished,
    userId,
  });

  if (updatedListItem.isPublished) {
    const searchLink = createListSearchBaseLink(updatedListItem.type);
    const { contactName, contactEmailAddress } = getListItemContactInformation(updatedListItem);
    const typeName = serviceName(updatedListItem.type);

    await sendDataPublishedEmail(
      contactName,
      contactEmailAddress,
      typeName,
      updatedListItem.address.country.name,
      searchLink
    );
  }
}

async function getListItem(listItemId: string, list: List): Promise<ListItemGetObject> {
  const listItem: ListItemGetObject = await findListItemById(listItemId);
  const listJson = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";
  return listItem;
}

async function initialiseFormRunnerSession(
  list: List,
  listItem: BaseListItemGetObject,
  message: string,
  isUnderTest: boolean
): Promise<string> {
  const questions = await generateFormRunnerWebhookData(list, listItem, isUnderTest);
  const formRunnerWebhookData = getNewSessionWebhookData(list.type, listItem.id, questions, message);
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(list.type);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);
  return createFormRunnerEditListItemLink(token);
}

export async function listItemEditRequestValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { listId, listItemId } = req.params;
  const userId = req.user?.userData?.id;

  const list = await findListById(listId);
  const listItem = await findListItemById(listItemId);

  if (userId === undefined) {
    return res.redirect(authRoutes.logout);
  }

  if (list === undefined) {
    const err = new HttpException(404, "404", `Could not find list ${listId}`);
    return next(err);
  } else if (listItem === undefined) {
    const err = new HttpException(404, "404", `Could not find list item ${listItemId}`);
    return next(err);
  } else if (list?.type !== listItem?.type) {
    const err = new HttpException(
      400,
      "400",
      `Trying to edit a list item which is a different service type to list ${listId}`
    );
    return next(err);
  } else if (list?.id !== listItem?.listId) {
    const err = new HttpException(400, "400", `Trying to edit a list item which does not belong to list ${listId}`);
    return next(err);
  } else if (!userIsListPublisher(req, list)) {
    const err = new HttpException(403, "403", "User does not have publishing rights on this list.");
    return next(err);
  }
  return next();
}
