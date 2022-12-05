import { NextFunction, Request, Response } from "express";
import { authRoutes } from "server/components/auth";
import { HttpException } from "server/middlewares/error-handlers";

export async function requestValidation(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (req.isUnauthenticated()) {
    return res.redirect(authRoutes.logout);
  }

  const { list, listItem } = res.locals;

  if (list.type !== listItem.type) {
    return next(
      new HttpException(400, "400", `Trying to edit a list item which is a different service type to list ${list.id}`)
    );
  }

  if (list.id !== listItem.listId) {
    const err = new HttpException(400, "400", `Trying to edit a list item which does not belong to list ${list.id}`);
    return next(err);
  }
  return next();
}
