import type { NextFunction, Request, Response } from "express";
import { logger } from "server/services/logger";

export function checkCountryQuestionAnswered(req: Request, res: Response, next: NextFunction) {
  const serviceType = req.params.serviceType;

  if (!serviceType) {
    next();
    return;
  }

  logger.info(`checkCountryQuestionAnswered: ${req.url} - ${req.params.serviceType}`);
  const session = req.session.application ?? {};
  const hasCountry = session.country ?? false;
  const isInitialisedSession = session.isInitialisedSession ?? false;

  if (!hasCountry || !isInitialisedSession) {
    logger.info(
      `checkCountryQuestionAnswered: ${req.url} - ${serviceType} - User has not answered country question, redirecting to start page`
    );

    res.redirect(`/application/${serviceType}/start`);
    return;
  }
  next();
}
