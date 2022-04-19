// TODO: Ideally all of the checks in the controller should be split off into reusable middleware rather then repeating in each controller
import { NextFunction, Request, Response } from "express";
import { findListById } from "server/models/list";
import {
  findListItemById,
  deleteListItem,
  togglerListItemIsPublished,
  update
} from "server/models/listItem/listItem";
import { authRoutes } from "server/components/auth";
import { getInitiateFormRunnerSessionToken, userIsListPublisher } from "server/components/dashboard/helpers";
import {
  AuditJsonData,
  CovidTestSupplierListItemGetObject,
  CovidTestSupplierListItemJsonData,
  JsonObject,
  LawyerListItemGetObject,
  LawyerListItemJsonData,
  List,
  ListItem,
  ListItemGetObject,
  ServiceType,
  User
} from "server/models/types";
import { dashboardRoutes } from "server/components/dashboard";
import { getCSRFToken } from "server/components/cookies/helpers";
import { AuditEvent, Status } from "@prisma/client";
import { prisma } from "server/models/db/prisma-client";
import { recordListItemEvent } from "server/models/audit";
import { logger } from "server/services/logger";
import { generateFormRunnerWebhookData, getNewSessionWebhookData } from "server/components/formRunner/helpers";
import {
  createFormRunnerEditListItemLink,
  createFormRunnerReturningUserLink,
  createListSearchBaseLink
} from "server/components/lists/helpers";
import { getChangedAddressFields, getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendDataPublishedEmail, sendEditDetailsEmail } from "server/services/govuk-notify";
import { UpdatableAddressFields } from "server/models/listItem/providers/types";
import { DEFAULT_VIEW_PROPS } from "server/components/dashboard/controllers";
import { CovidTestSupplierFormWebhookData, LawyersFormWebhookData } from "server/components/formRunner";

function mapUpdatedAuditJsonDataToListItem(listItem: LawyerListItemGetObject | CovidTestSupplierListItemGetObject,
                                           updatedJsonData: (LawyersFormWebhookData & JsonObject) | (CovidTestSupplierFormWebhookData & JsonObject)
): LawyerListItemJsonData | CovidTestSupplierListItemJsonData {
  return Object.assign(
    {},
    listItem.jsonData,
    ...Object.keys(listItem.jsonData).map(k => k in updatedJsonData && { [k]: updatedJsonData[k] })
  );
}

export async function listItemGetController(
  req: Request,
  res: Response
): Promise<void> {
  const { listId, listItemId } = req.params;
  const userId = req?.user?.userData?.id;

  const list = await findListById(listId);
  const listItem: LawyerListItemGetObject | CovidTestSupplierListItemGetObject = await findListItemById(listItemId);

  if (listItem.status === Status.EDITED) {
    const auditForEdits = listItem?.history
      ?.filter(audit => audit.auditEvent === "EDITED")
      .sort((a, b) => a.id - b.id)
      .pop();

    const auditJsonData: AuditJsonData = auditForEdits?.jsonData as AuditJsonData;
    const updatedJsonData = auditJsonData.updatedJsonData;
    if (updatedJsonData !== undefined) {
      switch(listItem.type) {
        case ServiceType.lawyers :
          listItem.jsonData = mapUpdatedAuditJsonDataToListItem(listItem, updatedJsonData) as LawyerListItemJsonData;
          break;
        case ServiceType.covidTestProviders :
          listItem.jsonData = mapUpdatedAuditJsonDataToListItem(listItem, updatedJsonData) as CovidTestSupplierListItemJsonData;
          break;
      }
      const updatedAddressFields: Partial<UpdatableAddressFields> = getChangedAddressFields(updatedJsonData, listItem.address);
      if (updatedAddressFields.firstLine) {
        listItem.address.firstLine = updatedAddressFields.firstLine;
      }
      if (updatedAddressFields.secondLine) {
        listItem.address.secondLine = updatedAddressFields.secondLine;
      }
      if (updatedAddressFields.city) {
        listItem.address.city = updatedAddressFields.city;
      }
      if (updatedAddressFields.postCode) {
        listItem.address.postCode = updatedAddressFields.postCode;
      }
    }
  }

  const isPinned = listItem?.pinnedBy?.some(user => userId === user.id) ?? false;
  res.render("dashboard/lists-item", {
    ...DEFAULT_VIEW_PROPS,
    req,
    list,
    listItem,
    isPinned,
    csrfToken: getCSRFToken(req)
  });
}

export async function listItemPostController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId } = req.params;
  const { message, action } = req.body;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson: LawyerListItemJsonData | CovidTestSupplierListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";
  const confirmationPages: { [key: string]: string } = {
    publish: "dashboard/list-item-confirm-publish",
    unpublish: "dashboard/list-item-confirm-unpublish",
    requestChanges: "dashboard/list-item-confirm-changes",
    update: "dashboard/list-item-confirm-update",
    pin: "dashboard/list-item-confirm-pin",
    unpin: "dashboard/list-item-confirm-pin",
    remove: "dashboard/list-item-confirm-remove",
  };

  const confirmationPage = confirmationPages[action];

  if (action === "requestChanges") {
    req.session.changeMessage = message;
  }

  res.render(confirmationPage, {
    ...DEFAULT_VIEW_PROPS,
    list,
    listItem,
    message,
    action,
    req,
    csrfToken: getCSRFToken(req),
  });
}

export async function listItemPinController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId } = req.params;
  const { action } = req.body;
  const userId = req?.user?.userData?.id;
  const isPinned = action === "pin";

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson: LawyerListItemJsonData | CovidTestSupplierListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";

  if (userId === undefined) {
    res.status(401).send({
      error: {
        message: `Unable to perform action - user could not be identified`,
      },
    });
    return;
  }
  let successBannerHeading = `${listItem.jsonData.organisationName} has been ${isPinned ? "pinned" : "unpinned"}`;
  const successBannerTitle = `${isPinned ? "Pinned" : "Unpinned"}`;
  const successBannerColour = "blue";

  try {
    await handlePinListItem(Number(listItemId), userId, isPinned);

    req.flash("successBannerTitle", successBannerTitle);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", successBannerColour);
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));

  } catch (error) {
    successBannerHeading = `${listItem.jsonData.organisationName} could not be updated. ${error.message}`;
    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      resultMessage: successBannerHeading,
      csrfToken: getCSRFToken(req)
    });
  }
}

export async function handlePinListItem(
  id: number,
  userId: User["id"],
  isPinned: boolean
): Promise<ListItem> {
  if (userId === undefined) {
    throw new Error("deleteListItem Error: userId is undefined");
  }
  const auditEvent = isPinned ? AuditEvent.PINNED : AuditEvent.UNPINNED;

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
            }
          }
        }),
        recordListItemEvent({
            eventName: "pin",
            itemId: id,
            userId
          },
          id,
          auditEvent
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
            }
          }
        }),
        recordListItemEvent({
            eventName: "unpin",
            itemId: id,
            userId
          },
          id,
          auditEvent
        ),
      ]);
    }

    return listItem;
  } catch (e) {
    logger.error(`deleteListItem Error ${e.message}`);

    throw new Error(`Failed to ${isPinned ? "pin" : "unpinned"} item`);
  }
}

export async function listItemDeleteController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId } = req.params;
  const userId = req?.user?.userData?.id;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson: LawyerListItemJsonData | CovidTestSupplierListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";

  if (userId === undefined) {
    res.status(401).send({
      error: {
        message: `Unable to perform action - user could not be identified`,
      },
    });
    return;
  }
  let successBannerTitle = `${listItem.jsonData.organisationName} has been removed`;
  const successBannerHeading = `Removed`;
  const successBannerColour = "red";

  try {
    await deleteListItem(Number(listItemId), userId);

    req.flash("successBannerTitle", successBannerTitle);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", successBannerColour);
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));

  } catch (error) {
    successBannerTitle = `${listItem.jsonData.organisationName} could not be updated. ${error.message}`;
    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      resultMessage: successBannerTitle,
      csrfToken: getCSRFToken(req)
    });
  }
}

export async function listItemUpdateController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId } = req.params;
  const listItemIdNumber = Number(listItemId);
  const userId = req?.user?.userData?.id;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson: LawyerListItemJsonData | CovidTestSupplierListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";

  if (userId === undefined) {
    res.status(401).send({
      error: {
        message: `Unable to perform action - user could not be identified`,
      },
    });
    return;
  }
  let successBannerHeading = `${listItem.jsonData.organisationName} has been updated and published`;
  const successBannerTitle = `Updated and published`;
  const successBannerColour = "green";

  try {
    await handleListItemUpdate(listItemIdNumber, userId);

    req.flash("successBannerTitle", successBannerTitle);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", successBannerColour);
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));

  } catch (error) {
    successBannerHeading = `${listItem.jsonData.organisationName} could not be updated. ${error.message}`;
    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      resultMessage: successBannerHeading,
      csrfToken: getCSRFToken(req)
    });
  }
}

export async function handleListItemUpdate(
  id: number,
  userId: User["id"]
): Promise<void> {
  const listItem = await prisma.listItem.findUnique({
    where: { id },
    include: {
      history: true
    }
  });
  if (listItem === undefined) {
    throw new Error(`Unable to store updates - listItem could not be found`);
  }

  const auditForEdits = listItem?.history
    .filter(audit => audit.auditEvent === "EDITED")
    .sort((a, b) => a.id - b.id)
    .pop();

  const auditJsonData: AuditJsonData = auditForEdits?.jsonData as AuditJsonData;

  if (auditJsonData?.updatedJsonData !== undefined) {
    await update(id, userId, auditJsonData.updatedJsonData);
  }
}

export async function listItemRequestChangeController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId, underTest } = req.params;
  const userId = req?.user?.userData?.id;
  const changeMessage: string = req.session?.changeMessage ?? "";
  const isUnderTest = underTest === "true";

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem = await getListItem(listItemId, list);

  if (userId === undefined) {
    res.status(401).send({
      error: {
        message: `Unable to perform action - user could not be identified`,
      },
    });
    return;
  }
  let successBannerHeading = `Requested`;
  const successBannerColour = "blue";
  const successBannerTitle = `Change request sent to ${listItem.jsonData.organisationName} ${changeMessage}`;

  try {
    await handleListItemRequestChanges(list, listItem, isUnderTest, changeMessage, userId);

    req.flash("successBannerTitle", successBannerTitle);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", successBannerColour);
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));

  } catch (error) {
    successBannerHeading = `${listItem.jsonData.organisationName} could not be updated. ${error.message}`;
    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      resultMessage: successBannerHeading,
      csrfToken: getCSRFToken(req)
    });
  }
}

async function handleListItemRequestChanges(list: List, listItem: LawyerListItemGetObject, isUnderTest: boolean, message: string, userId: User["id"]): Promise<void> {
  if (userId === undefined) {
    throw new Error("handleListItemRequestChange Error: userId is undefined");
  }
  const formRunnerEditUserUrl = await initialiseFormRunnerSession(list, listItem, isUnderTest, message);

  // Email applicant
  const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);
  const listType = serviceName(list?.type ?? "");
  await sendEditDetailsEmail(
    contactName,
    contactEmailAddress,
    listType,
    message,
    formRunnerEditUserUrl,
  );

  const status = Status.OUT_WITH_PROVIDER;
  const auditEvent = AuditEvent.OUT_WITH_PROVIDER;

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
      recordListItemEvent({
          eventName: "requestChange",
          itemId: listItem.id,
          userId,
          requestedChanges: message,
        },
        listItem.id,
        auditEvent
      ),
    ]);
  } catch (error) {
    throw new Error(`handleListItemRequestChanges error: could not update listItem: ${error.message}`);
  }
}

export async function listItemPublishController(
  req: Request,
  res: Response,
): Promise<void> {
  const { listId, listItemId } = req.params;
  const { action } = req.body;
  const userId = req?.user?.userData?.id;
  const isPublished = action === "published";

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const list = await findListById(listId) ?? {} as List;
  const listItem = await getListItem(listItemId, list);

  if (userId === undefined) {
    res.status(401).send({
      error: {
        message: `Unable to perform action - user could not be identified`,
      },
    });
    return;
  }
  const successBannerHeading = `${action}ed`;
  const successBannerColour = "green";
  let successBannerTitle = `${listItem.jsonData.organisationName} has been ${successBannerHeading}`;

  try {
    await handlePublishListItem(Number(listItemId), isPublished, userId);

    req.flash("successBannerTitle", successBannerTitle);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", successBannerColour);
    res.redirect(dashboardRoutes.listsItems.replace(":listId", listId));

  } catch (error) {
    successBannerTitle = `${listItem.jsonData.organisationName} could not be updated. ${error.message}`;
    res.render("dashboard/lists-item", {
      ...DEFAULT_VIEW_PROPS,
      req,
      list,
      listItem,
      resultMessage: successBannerTitle,
      csrfToken: getCSRFToken(req)
    });
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

async function getListItem(listItemId: string, list: List): Promise<LawyerListItemGetObject> {
  const listItem: LawyerListItemGetObject = await findListItemById(listItemId) as LawyerListItemGetObject;
  const listJson: LawyerListItemJsonData | CovidTestSupplierListItemJsonData = listItem.jsonData;
  listJson.country = list?.country?.name ?? "";
  return listItem;
}

async function initialiseFormRunnerSession(list: List, listItem: ListItemGetObject, isUnderTest: boolean, message: string): Promise<string> {
  const questions = await generateFormRunnerWebhookData(list, listItem, isUnderTest);
  const formRunnerWebhookData = getNewSessionWebhookData(list.type, listItem.id, questions, message);
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(list.type);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);
  const formRunnerEditUserUrl = createFormRunnerEditListItemLink(token);
  return formRunnerEditUserUrl;
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
    res.status(404).send({
      error: {
        message: `Could not find list ${listId}`,
      },
    });

  } else if (listItem === undefined) {
    res.status(404).send({
      error: {
        message: `Could not find list item ${listItemId}`,
      },
    });

  } else if (list?.type !== listItem?.type) {
    res.status(400).send({
      error: {
        message: `Trying to edit a list item which is a different service type to list ${listId}`,
      },
    });

  } else if (list?.id !== listItem?.listId) {
    res.status(400).send({
      error: {
        message: `Trying to edit a list item which does not belong to list ${listId}`,
      },
    });

  } else if (!userIsListPublisher(req, list)) {
    res.status(403).send({
      error: {
        message: "User doesn't have publishing right on this list",
      },
    });
  }
  return next();
}
