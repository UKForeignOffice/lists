import type { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { getServiceLabel } from "server/components/lists";
import serviceName from "server/utils/service-name";
import { logger } from "server/services/logger";
import { HttpException } from "server/middlewares/error-handlers";
import { normaliseServiceType } from "server/components/lists/find/helpers/normaliseServiceType";

export function validateServiceTypeParam(req: Request, res: Response, next: NextFunction, serviceType: string) {
  const normalisedServiceType = normaliseServiceType(serviceType);
  const schema = Joi.string().allow("lawyers", "funeral-directors", "translators-interpreters").only();
  const { error } = schema.validate(normalisedServiceType);

  if (error) {
    logger.error(`User requested ${serviceType} but it was not recognised`);
    next(new HttpException(404, "404", " "));
    return;
  }

  res.locals.findServiceType = normalisedServiceType;
  res.locals.serviceLabel = getServiceLabel(serviceType);
  res.locals.serviceType = serviceType;
  res.locals.serviceLabelPlural = serviceName(serviceType);

  next();
}
