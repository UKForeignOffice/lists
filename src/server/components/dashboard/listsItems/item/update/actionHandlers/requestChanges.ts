import { ListItemGetObject, User } from "server/models/types";
import { logger } from "server/services/logger";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendEditDetailsEmail } from "server/services/govuk-notify";
import { AuditEvent, ListItem, Status } from "@prisma/client";
import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";
import { recordListItemEvent } from "server/models/audit";
import { ListItemRes } from "server/components/dashboard/listsItems/types";
import { Request } from "express";

/**
 * TODO: remove underTest
 */
export async function requestChanges(req: Request, res: ListItemRes) {
  const { underTest } = req.params;
  const isUnderTest = underTest === "true";
  const userId = req.user!.id;
  const changeMessage = req.session.update?.message;
  const { listItem } = res.locals;
  const { listItemUrl, listIndexUrl } = res.locals;

  if (!changeMessage) {
    req.flash("errorMsg", "You must provide a message to request a change");
    return res.redirect(listItemUrl);
  }

  const jsonData = listItem.jsonData as ListItemGetObject["jsonData"];

  try {
    await handleListItemRequestChanges(listItem, changeMessage, userId, isUnderTest);

    req.flash("successBannerTitle", `Change request sent to ${jsonData?.organisationName}`);
    req.flash("successBannerHeading", "Requested");
    req.flash("successBannerColour", "blue");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${jsonData?.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}

async function handleListItemRequestChanges(
  listItem: ListItem,
  message: string,
  userId: User["id"],
  isUnderTest: boolean
): Promise<void> {
  if (userId === undefined) {
    throw new Error("handleListItemRequestChange Error: userId is undefined");
  }
  logger.info(`user ${userId} is requesting changes for ${listItem.id}`);
  const list = {
    type: listItem.type,
  };

  const formRunnerEditUserUrl = await initialiseFormRunnerSession({ list, listItem, message, isUnderTest });

  // Email applicant
  logger.info(`Generated form runner URL [${formRunnerEditUserUrl}], getting list item contact info.`);
  const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);

  logger.info(`Got contact info [${contactName}, ${contactEmailAddress}], getting list item contact info.`);
  const listType = serviceName(listItem.type ?? "");

  logger.info(`Got list type [${listType}`);
  await sendEditDetailsEmail(contactName, contactEmailAddress, listType, message, formRunnerEditUserUrl);
  logger.info(`Sent email, updating listItem`);

  const { isPublished } = listItem;
  const status = Status.OUT_WITH_PROVIDER;
  const auditEvent = AuditEvent.OUT_WITH_PROVIDER;

  logger.info(`user ${userId} is unpublishing ${listItem.id} and setting status ${status}`);

  try {
    await prisma.$transaction([
      prisma.listItem.update({
        where: { id: listItem.id },
        data: {
          status,
          isPublished,
          history: {
            create: [EVENTS.OUT_WITH_PROVIDER(userId, message)],
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
    ]);
  } catch (error: any) {
    logger.error(`handleListItemRequestChanges error: could not update listItem: ${error.message}`);
    throw new Error(`handleListItemRequestChanges error: could not update listItem: ${error.message}`);
  }
}
