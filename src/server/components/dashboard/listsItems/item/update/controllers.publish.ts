import { Request, Response } from "express";
import { EventJsonData, User } from "server/models/types";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { ListItemEvent } from "@prisma/client";
import { update } from "server/models/listItem";

export async function listItemUpdateController(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const listItem = res.locals.listItem;
  const { listItemUrl, listIndexUrl } = res.locals;

  try {
    await handleListItemUpdate(listItem.id, userId);

    if (userId === undefined) {
      req.flash("errorMsg", "Unable to perform action - user could not be identified");
      return res.redirect(listItemUrl);
    }

    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been updated and published`);
    req.flash("successBannerHeading", "Updated and published");
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
  }
}

export async function handleListItemUpdate(id: number, userId: User["id"]): Promise<void> {
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

  logger.info(`found edit event ${JSON.stringify(editEvent)}`);

  const auditJsonData: EventJsonData = editEvent?.jsonData as EventJsonData;

  // @ts-ignore
  if (listItem.jsonData?.updatedJsonData) {
    await update(id, userId);
    return;
  }

  if (auditJsonData?.updatedJsonData) {
    await update(id, userId);
    return;
  }

  if (auditJsonData?.updatedJsonData !== undefined) {
    // @ts-ignore
    await update(id, userId, auditJsonData.updatedJsonData);
  }
}
