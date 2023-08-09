import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { logger } from "server/services/logger";

import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import type { User } from "server/models/types";
import { SERVICE_DOMAIN, isLocalHost } from "server/config";
import type { Request, Response, NextFunction } from "express";

interface EditDetailsInput {
  listItem: ListItemWithAddressCountry;
  message: string;
  userId: User["id"];
  isAnnualReview: boolean;
}

export async function editDetails(req: Request, res: Response, next: NextFunction) {
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
  req.session.currentlyEditingStartTime = Date.now();
  res.redirect(editDetailsUrl.result);
}

export async function createEditDetailsURL({ listItem, message, userId, isAnnualReview }: EditDetailsInput) {
  logger.info(`user with id: ${userId} is editing details for list item with id: ${listItem.id}`);
  const list = { type: listItem.type };

  try {
    const title = "Change provider details";
    const protocol = isLocalHost ? "http" : "https";
    const redirectUrl = `${protocol}://${SERVICE_DOMAIN}/dashboard/lists/${listItem.listId}/items/${listItem.id}`;
    const formRunnerEditUserUrl = await initialiseFormRunnerSession({
      list,
      listItem,
      message,
      isAnnualReview,
      title,
      redirectUrl,
      isPostEdit: true,
      userId,
    });
    return { result: formRunnerEditUserUrl };
  } catch (error) {
    logger.error(`createEditDetailsURL error: could not initialise a form runner session: ${(error as Error).message}`);
    return { error: error as Error };
  }
}
