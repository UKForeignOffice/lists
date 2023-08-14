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

  if (session.isInitialisedSession === true) {
    logger.info(
      `checkCountryQuestionAnswered: ${req.url} - User entered through /application/session - country check not required`
    );
    next();
    return;
  }

  if (!session.country) {
    res.redirect(`/application/${serviceType}/start`);
    return;
  }

  next();
}
