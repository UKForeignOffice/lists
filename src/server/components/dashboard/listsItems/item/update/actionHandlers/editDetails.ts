import { initialiseFormRunnerSession } from "server/components/formRunner/helpers";
import { logger } from "server/services/logger";

import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import type { User } from "server/models/types";
import type { NextFunction, Request, Response } from "express";
import { isLocalHost, SERVICE_DOMAIN } from "server/config";

interface EditDetailsInput {
  listItem: ListItemWithAddressCountry;
  message: string;
  userId: User["id"];
  isAnnualReview: boolean;
}

export async function editDetails(req: Request, res: Response, next: NextFunction) {
  console.log("edit details");
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
  res.redirect(editDetailsUrl.result);
}

export async function createEditDetailsURL({ listItem, message, userId, isAnnualReview }: EditDetailsInput) {
  logger.info(`user with id: ${userId} is editing details for list item with id: ${listItem.id}`);
  const list = { type: listItem.type };
  const metadata = {
    isPostEdit: true,
  };
  console.log("listItem", listItem);

  try {
    const title = "Change provider details";
    const formRunnerEditUserUrl = await initialiseFormRunnerSession({
      list,
      listItem,
      message,
      isAnnualReview,
      title,
      metadata,
      skipSummaryUrl: `${isLocalHost ? "http" : "https"}://${SERVICE_DOMAIN}/dashboard/lists/${listItem.listId}/items/${
        listItem.id
      }`,
    });
    return { result: formRunnerEditUserUrl };
  } catch (error) {
    logger.error(`createEditDetailsURL error: could not initialise a form runner session: ${(error as Error).message}`);
    return { error: error as Error };
  }
}
