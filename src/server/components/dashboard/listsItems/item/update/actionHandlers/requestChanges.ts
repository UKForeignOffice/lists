import { Request, Response } from "express";
import { List, ListItemGetObject, User } from "server/models/types";
import { logger } from "server/services/logger";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendEditDetailsEmail } from "server/services/govuk-notify";
import { AuditEvent, Status } from "@prisma/client";
import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";
import { recordListItemEvent } from "server/models/audit";

/**
 * TODO: remove underTest
 */
export async function requestChanges(req: Request, res: Response): Promise<void> {
  const { underTest } = req.params;
  const isUnderTest = underTest === "true";
  const userId = req.user!.id;
  const changeMessage: string = req.session?.changeMessage ?? "";
  const { list, listItem } = res.locals;
  const { listItemUrl, listIndexUrl } = res.locals;

  if (!changeMessage) {
    req.flash("errorMsg", "You must provide a message to request a change");
    return res.redirect(listItemUrl);
  }

  try {
    await handleListItemRequestChanges(list, listItem, changeMessage, userId, isUnderTest);

    req.flash("successBannerTitle", `Change request sent to ${listItem.jsonData.organisationName}`);
    req.flash("successBannerHeading", "Requested");
    req.flash("successBannerColour", "blue");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
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
  logger.info(`user ${userId} is requesting changes for ${listItem.id}`);
  const formRunnerEditUserUrl = await initialiseFormRunnerSession({ list, listItem, message, isUnderTest });

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

  logger.info(`user ${userId} is unpublishing ${listItem.id} and setting status ${status}`);

  try {
    await prisma.$transaction([
      prisma.listItem.update({
        where: { id: listItem.id },
        data: {
          status,
          isPublished: false,
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
