import { NextFunction, Request } from "express";
import { ListIndexRes } from "server/components/dashboard/listsItems/types";
import { logger } from "server/services/logger";
import { HttpException } from "server/middlewares/error-handlers";

export async function validateAccessToList(req: Request, res: ListIndexRes, next: NextFunction) {
  const { list } = res.locals;
  const userHasAccessToList = await req.user?.hasAccessToList(list!.id);

  if (!userHasAccessToList) {
    logger.warn(`user ${req.user?.id} attempted to change list ${list!.id} but does not have access`);
    return next(new HttpException(403, "403", "User is not authorised to access this list."));
  }
  next();
}
