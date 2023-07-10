import { logger } from "server/services/logger";
import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendEditDetailsEmail } from "server/services/govuk-notify";
import { Status } from "@prisma/client";
import { prisma } from "server/models/db/prisma-client";
import { EVENTS } from "server/models/listItem/listItemEvent";

import type { ListItemGetObject, User } from "server/models/types";
import type { ListItemRes } from "server/components/dashboard/listsItems/types";
import type { Request } from "express";
import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";

export async function requestChanges(req: Request, res: ListItemRes) {
  const userId = req.user!.id;
  const changeMessage = req.session.update?.message;
  const { listItem } = res.locals;
  const { isAnnualReview } = listItem;
  const { listItemUrl, listIndexUrl } = res.locals;

  if (!changeMessage) {
    req.flash("errorMsg", "You must provide a message to request a change");
    res.redirect(listItemUrl);
    return;
  }

  const jsonData = listItem.jsonData as ListItemGetObject["jsonData"];

  try {
    // @ts-ignore
    await handleListItemRequestChanges(listItem, changeMessage, userId, isAnnualReview);

    req.flash("successBannerTitle", `Change request sent to ${jsonData?.organisationName}`);
    req.flash("successBannerHeading", "Requested");
    req.flash("successBannerColour", "blue");
    res.redirect(listIndexUrl);
    return;
  } catch (error: any) {
    req.flash("errorMsg", `${jsonData?.organisationName} could not be updated.`);
    res.redirect(listItemUrl);
  }
}

async function handleListItemRequestChanges(
  listItem: ListItemWithAddressCountry,
  message: string,
  userId: User["id"],
  isAnnualReview: boolean
): Promise<void> {
  if (userId === undefined) {
    throw new Error("handleListItemRequestChange Error: userId is undefined");
  }
  logger.info(`user with id: ${userId} is requesting changes for list item with id: ${listItem.id}`);
  const list = {
    type: listItem.type,
  };

  const formRunnerEditUserUrl = await initialiseFormRunnerSession({ list, listItem, message, isAnnualReview });

  // Email applicant
  logger.info(`Generated form runner URL [${formRunnerEditUserUrl}] from a change request by user [${userId}].`);
  const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);
  const listType = serviceName(listItem.type ?? "");

  await sendEditDetailsEmail(contactName, contactEmailAddress, listType, message, formRunnerEditUserUrl);
  logger.info(
    `Change request email sent to provider with these deatils name: ${contactName}, email: ${contactEmailAddress} service: ${listType}`
  );

  const status = Status.OUT_WITH_PROVIDER;

  logger.info(`user ${userId} is unpublishing ${listItem.id} and setting status ${status}`);

  try {
    await prisma.listItem.update({
      where: { id: listItem.id },
      data: {
        status,
        history: {
          create: [EVENTS.OUT_WITH_PROVIDER(userId, message)],
        },
      },
    });
  } catch (error: any) {
    logger.error(`handleListItemRequestChanges error: could not update listItem: ${error.message}`);
    throw new Error(`handleListItemRequestChanges error: could not update listItem: ${error.message}`);
  }
}
