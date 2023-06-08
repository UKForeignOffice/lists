import type { Request, Response } from "express";
import type { EventJsonData, ListItem, User } from "server/models/types";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { ListItemEvent, Status } from "@prisma/client";
import { togglerListItemIsPublished, update } from "server/models/listItem";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { sendPublishedEmail } from "./helpers";
import { startCase } from "lodash";
import { sendManualActionNotificationToPost } from "server/services/govuk-notify";

export async function handleListItemUpdate(id: number, userId: User["id"]) {
  logger.info(`${userId} looking for ${id} to update`);
  const listItem = await prisma.listItem.findUnique({
    where: { id },
    include: {
      history: {
        orderBy: {
          time: "desc",
        },
      },
    },
  });

  if (listItem === null) {
    logger.error(`${userId} tried to look for ${id}, listItem could not be found`);
    throw new Error(`Unable to store updates - listItem could not be found`);
  }

  const editEvent = listItem?.history.find((event) => {
    // @ts-ignore
    return event.type === ListItemEvent.EDITED && !!event.jsonData?.updatedJsonData;
  });

  if (editEvent) {
    logger.info(`found edit event ${JSON.stringify(editEvent)}`);
  }

  const auditJsonData: EventJsonData = editEvent?.jsonData as EventJsonData;

  if (auditJsonData?.updatedJsonData) {
    // @ts-ignore
    logger.info(
      `Updating ${listItem.id} with explicit 3rd parameter: ${JSON.stringify(auditJsonData.updatedJsonData)}`
    );
    // @ts-ignore
    return update(id, userId, auditJsonData.updatedJsonData);
  }

  const listItemJsonData = listItem.jsonData as ListItemJsonData;

  logger.info(`Updating ${listItem.id} with ${JSON.stringify(listItemJsonData.updatedJsonData)}`);
  return update(id, userId);
}

export async function publish(req: Request, res: Response) {
  const { update = {} } = req.session;
  const { action } = update;
  const isPublished = action === "publish";

  const { listItem, listItemUrl, listIndexUrl } = res.locals;
  const verb = isPublished ? "published" : "unpublished";
  let organisationName = listItem.jsonData.organisationName;
  try {
    const updatedListItem = await handlePublishListItem(listItem, isPublished, req.user!.id);
    const jsonData = updatedListItem?.jsonData ?? listItem.jsonData;
    organisationName = jsonData?.organisationName ?? jsonData.organisationName;
    req.flash("successBannerTitle", `${organisationName} has been ${verb}`);
    req.flash("successBannerHeading", startCase(verb));
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}

export async function handlePublishListItem(listItem: ListItem, isPublished: boolean, userId: User["id"]) {
  const updatedListItem = await togglerListItemIsPublished({
    id: listItem.id,
    isPublished,
    jsonData: listItem.jsonData as ListItemJsonData,
    userId,
  });

  if (updatedListItem.isPublished) {
    await sendPublishedEmail(updatedListItem);
  }

  if (updatedListItem.status === Status.UNPUBLISHED) {
    await sendManualActionNotificationToPost(listItem.listId, "sendManualUnpublishedEmail");
  }
  return updatedListItem;
}
