import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { userIsListPublisher } from "server/components/dashboard/helpers";

import type { NextFunction, Request, Response } from "express";
import type { List } from "server/models/types";
import { HttpException } from "server/middlewares/error-handlers";

export async function redirectIfUnauthorised(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.params;

    if (!Number.isInteger(Number(listId))) throw new Error("listId is not a number");

    const listData = (await prisma.list.findUnique({
      where: {
        id: Number(listId),
      },
    })) as List;

    const userCanPublishList = userIsListPublisher(req, listData);

    if (!userCanPublishList) {
      const err = new HttpException(403, "403", "User is not authorized to access this list.");
      return next(err);
    }

    next();
  } catch (error) {
    logger.error(`redirectIfUnauthorised Error: ${(error as Error).message}`);
    const err = new HttpException(403, "403", "Unable to validate this request.  Please try again.");
    return next(err);
  }
}
