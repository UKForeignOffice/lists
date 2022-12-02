import { NextFunction, Request, Response } from "express";
import { authRoutes } from "server/components/auth";
import { logger } from "server/services/logger";
import { HttpException } from "server/middlewares/error-handlers";
import { ListIndexRes } from "server/components/dashboard/listsItems/types";

export async function validateAccessToList(req: Request, res: ListIndexRes, next: NextFunction) {
  const { list } = res.locals;
  const userHasAccessToList = await req.user?.hasAccessToList(list!.id);

  if (!userHasAccessToList) {
    logger.warn(`${req.user?.userData.id} attempted to change ${list!.id} but does not have access`);
    return next(new HttpException(403, "403", "User is not authorised to access this list."));
  }
  next();
}

export async function listItemEditRequestValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.isUnauthenticated()) {
    return res.redirect(authRoutes.logout);
  }

  const { list, listItem } = res.locals;
  const listId = list?.id;

  if (list.type !== listItem.type) {
    return next(
      new HttpException(400, "400", `Trying to edit a list item which is a different service type to list ${listId}`)
    );
  }

  if (list.id !== listItem.listId) {
    const err = new HttpException(400, "400", `Trying to edit a list item which does not belong to list ${listId}`);
    return next(err);
  }
  return next();
}
