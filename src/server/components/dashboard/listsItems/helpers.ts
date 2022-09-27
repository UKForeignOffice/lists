import { logger } from "server/services/logger";
import { prisma } from "server/models/db/prisma-client";
import { userIsListPublisher } from "server/components/dashboard/helpers";

import type { NextFunction, Request, Response } from "express";
import type { List } from "server/models/types";

export async function redirectIfUnauthorised(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { listId } = req.params;
    const listData = (await prisma.list.findUnique({
      where: {
        id: Number(listId),
      },
    })) as List;

    const userCanPublishList = userIsListPublisher(req, listData);

    if (!userCanPublishList) {
      logger.error("User doesn't have publishing right on this list");
      return res.render("errors/403", {
        message: "User does not have publishing rights on this list",
      });
    }

    next();
  } catch (error) {
    logger.error(`redirectIfUnauthorised Error: ${(error as Error).message}`);
  }
}
