import type { NextFunction, Request, Response } from "express";
import { setEmailIsVerified } from "server/models/listItem/listItem";
import { DEFAULT_VIEW_PROPS } from "./../constants";
import { ServiceType } from "shared/types";
import { getServiceTypeName } from "./../helpers";
import { sendManualActionNotificationToPost } from "server/services/govuk-notify";

/**
 * removing DEFAULT_VIEW_PROPS from this file causes the compiler to crash??
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FIX = { ...DEFAULT_VIEW_PROPS };

export async function listsConfirmApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { reference } = req.params;

  try {
    const { type, listId } = await setEmailIsVerified({
      reference,
    });

    if (type === undefined) {
      res.sendStatus(404);
    } else {
      let serviceName: string;

      switch (type) {
        case ServiceType.lawyers:
          serviceName = "Find a lawyer abroad";
          break;
        case ServiceType.funeralDirectors:
          serviceName = "Find a funeral director abroad";
          break;
        case ServiceType.translatorsInterpreters:
          serviceName = "Find a translator or interpreter abroad";
          break;
        default:
          serviceName = "Find a professional service abroad";
      }

      await sendManualActionNotificationToPost(listId as number, "PROVIDER_SUBMITTED");

      res.render("lists/application-confirmation-page", {
        serviceName,
      });
    }
  } catch (e) {
    next(e);
  }
}

export function listsGetPrivateBetaPage(req: Request, res: Response, next: NextFunction): void {
  const { serviceType } = req.query;

  if (serviceType === undefined) {
    next();
    return;
  }

  res.render("lists/private-beta-page", {
    serviceType: getServiceTypeName(serviceType as string),
    ServiceType,
  });
}

export function listsGetNonExistent(req: Request, res: Response) {
  const { serviceType, country } = req.query;
  const backLink = `/find?serviceType=${serviceType}&readNotice=ok`;
  const typedServiceType = serviceType as "translatorsInterpreters" | "lawyers" | "funeralDirectors";

  const serviceTypes = {
    translatorsInterpreters: "translators or interpreters",
    lawyers: "lawyers",
    funeralDirectors: "funeral directors",
  };

  res.render("lists/non-existent-list", {
    serviceType: serviceTypes[typedServiceType],
    country,
    backLink,
  });
}
