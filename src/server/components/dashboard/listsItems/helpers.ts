import { logger } from "server/services/logger";

import type { NextFunction, Request } from "express";
import { HttpException } from "server/middlewares/error-handlers";
import { prisma } from "server/models/db/prisma-client";
import { ListItemRes } from "server/components/dashboard/listsItems/types";
import { ServiceType } from "server/models/types";

export async function redirectIfUnauthorised(req: Request, res: ListItemRes, next: NextFunction): Promise<void> {
  try {
    const { list } = res.locals;
    const userCanPublishList = (await req.user?.isListPublisher(list!.id)) ?? false;

    if (!userCanPublishList) {
      const err = new HttpException(403, "403", "User is not authorised to access this list.");
      return next(err);
    }

    next();
  } catch (error) {
    logger.error(`redirectIfUnauthorised Error: ${(error as Error).message}`);
    const err = new HttpException(403, "403", "Unable to validate this request. Please try again.");
    return next(err);
  }
}

export async function getListOverview(id: number) {
  return await prisma.list.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      country: true,
      jsonData: false,
    },
  });
}

/**
 * TODO: - tbh there's far too much manual translation in the app now. Time to consider i18n or pluralisation
 */
export const serviceTypeDetailsHeading: Record<ServiceType | string, string> = {
  covidTestProviders: "Covid test provider",
  funeralDirectors: "Funeral director",
  lawyers: "Lawyer",
  translatorsInterpreters: "Translator or interpreter",
};
