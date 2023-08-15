import type { NextFunction, Request, Response } from "express";
import { logger } from "server/services/logger";
import { listExists } from "server/components/proxyMiddleware/helpers";

export function checkCountryQuestionAnswered(req: Request, res: Response, next: NextFunction) {
  const serviceType = req.params.serviceType;

  if (!serviceType) {
    next();
    return;
  }

  const session = req.session.application ?? {};

  if (session.isInitialisedSession === true) {
    logger.info(
      `checkCountryQuestionAnswered: ${req.url} - User entered through /application/session - country check not required`
    );
    next();
    return;
  }

  if (!session.country) {
    logger.info(
      `checkCountryQuestionAnswered: ${req.url} - ${serviceType} user has not answered country question, redirecting to start`
    );

    res.redirect(`/application/${serviceType}/start`);
    return;
  }

  next();
}

export async function checkIsExistingList(req: Request, res: Response, next: NextFunction) {
  const { serviceType } = req.params;
  const session = req.session.application ?? {};

  if (session.isInitialisedSession === true) {
    logger.info(
      `checkIsExistingList: ${req.url} - User entered through /application/session - country check not required`
    );
    next();
    return;
  }

  const { country, type } = session;
  const sessionTypeMatchesReqType = serviceType === type;

  if (country && sessionTypeMatchesReqType) {
    const list = await listExists(country, type);
    if (list) {
      next();
      return;
    }
    logger.info(
      `checkIsExistingList: ${req.url} - User had country ${country} and ${type} but does not exist - redirecting to /application/${serviceType}`
    );
  }

  // reset session and redirect to start page
  req.session.application = {};
  res.redirect(`/application/${serviceType}`);
}
