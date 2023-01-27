import { Request, Response } from "express";
import { EventJsonData, User } from "server/models/types";
import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { ListItemEvent } from "@prisma/client";
import { togglerListItemIsPublished } from "server/models/listItem";
import { createListSearchBaseLink } from "server/components/lists";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendDataPublishedEmail } from "server/services/govuk-notify";
import { update } from "server/components/dashboard/listsItems/item/update/actionHandlers/update";

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

export async function publish(req: Request, res: Response): Promise<void> {
  const { action } = req.body;
  const isPublished = action === "publish";

  const { listItem, listItemUrl, listIndexUrl } = res.locals;

  try {
    await handlePublishListItem(listItem.id, isPublished, req.user!.id);

    const successBannerHeading = `${action}ed`;
    req.flash("successBannerTitle", `${listItem.jsonData.organisationName} has been ${successBannerHeading}`);
    req.flash("successBannerHeading", successBannerHeading);
    req.flash("successBannerColour", "green");
    return res.redirect(listIndexUrl);
  } catch (error: any) {
    req.flash("errorMsg", `${listItem.jsonData.organisationName} could not be updated. ${error.message}`);
    return res.redirect(listItemUrl);
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
