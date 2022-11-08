import { logger } from "server/services/logger";

import type { NextFunction, Request, Response } from "express";
import { HttpException } from "server/middlewares/error-handlers";

export async function redirectIfUnauthorised(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { list } = res.locals;
    const userCanPublishList = req.user?.isListPublisher(list.id) ?? false;

    if (!userCanPublishList) {
      const err = new HttpException(403, "403", "User is not authorised to access this list.");
      return next(err);
    }

    next();
  } catch (error) {
    logger.error(`redirectIfUnauthorised Error: ${(error as Error).message}`);
    const err = new HttpException(403, "403", "Unable to validate this request Please try again.");
    return next(err);
  }
}
