import { Response } from "express";
import { EventJsonData, User } from "server/models/types";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { ListItemEvent } from "@prisma/client";
import { togglerListItemIsPublished, update } from "server/models/listItem";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { ActionHandlersReq } from "./../types";
import { sendPublishedEmail } from "./helpers";
import { startCase } from "lodash";

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

export async function publish(req: ActionHandlersReq, res: Response) {
  const { update = {} } = req.session;
  const { action } = update;
  const isPublished = action === "publish";

  const { listItem, listItemUrl, listIndexUrl } = res.locals;

  const verb = isPublished ? "published" : "unpublished";

  try {
    await handlePublishListItem(listItem.id, isPublished, req.user!.id);

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been ${verb}`);
    req.flash("successBannerHeading", startCase(verb));
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}

export async function handlePublishListItem(listItemId: number, isPublished: boolean, userId: User["id"]) {
  const updatedListItem = await togglerListItemIsPublished({
    id: listItemId,
    isPublished,
    userId,
  });

  if (updatedListItem.isPublished) {
    return await sendPublishedEmail(updatedListItem);
  }
}
