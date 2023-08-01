import { logger } from "server/services/logger";

import type { NextFunction, Request } from "express";
import { HttpException } from "server/middlewares/error-handlers";
import { prisma } from "server/models/db/prisma-client";
import type { ListItemRes } from "server/components/dashboard/listsItems/types";
import type { ListItem, User } from "server/models/types";
import type { ServiceType } from "shared/types";
import { recordListItemEvent } from "shared/audit";
import { AuditEvent } from "@prisma/client";
import { EVENTS } from "server/models/listItem/listItemEvent";

/**
 * TODO:- this does not redirect, just next(err) which renders
 */
export async function redirectIfUnauthorised(req: Request, res: ListItemRes, next: NextFunction): Promise<void> {
  try {
    const { list } = res.locals;
    const userHasAccessToList = await req.user?.hasAccessToList(list!.id);

    if (!userHasAccessToList) {
      const err = new HttpException(403, "403", "User is not authorised to access this list.");
      next(err);
      return;
    }

    next();
  } catch (error) {
    logger.error(`redirectIfUnauthorised Error: ${(error as Error).message}`);
    const err = new HttpException(403, "403", "Unable to validate this request. Please try again.");
    next(err);
  }
}

export async function getListOverview(id: number) {
  return await prisma.list.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      country: true,
      nextAnnualReviewStartDate: true,
      lastAnnualReviewStartDate: true,
      jsonData: true,
      isAnnualReview: true,
    },
  });
}

/**
 * TODO: - tbh there's far too much manual translation in the app now. Time to consider i18n or pluralisation
 */
export const serviceTypeDetailsHeading: Record<ServiceType | string, string> = {
  funeralDirectors: "Funeral director",
  lawyers: "Lawyer",
  translatorsInterpreters: "Translator or interpreter",
};

export async function handlePinListItem(id: number, userId: User["id"], isPinned: boolean): Promise<ListItem> {
  if (userId === undefined) {
    throw new Error("deleteListItem Error: userId is undefined");
  }

  try {
    const auditEvent = recordListItemEvent(
      {
        eventName: isPinned ? "pin" : "unpin",
        itemId: id,
        userId,
      },
      isPinned ? AuditEvent.PINNED : AuditEvent.UNPINNED
    );

    const connectOrDisconnect = isPinned ? "connect" : "disconnect";
    const pinOrUnpinEvent = isPinned ? EVENTS.PINNED(userId) : EVENTS.PINNED(userId);

    const [listItem] = await prisma.$transaction([
      prisma.listItem.update({
        where: {
          id,
        },
        data: {
          pinnedBy: {
            [connectOrDisconnect]: [{ id: userId }],
          },
          history: {
            create: [pinOrUnpinEvent],
          },
        },
      }),
      auditEvent,
    ]);

    return listItem;
  } catch (e: any) {
    logger.error(`deleteListItem Error ${e.message}`);

    throw new Error(`Failed to ${isPinned ? "pin" : "unpinned"} item`);
  }
}
