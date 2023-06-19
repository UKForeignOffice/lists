import type { Request, Response, NextFunction } from "express";
import express from "express";
import { kebabCase } from "lodash";
import * as handlers from "./handers";
import { getServiceLabel } from "server/components/lists";
import serviceName from "server/utils/service-name";
import { getParameterValue, removeQueryParameter } from "server/components/lists/helpers";
import { URLSearchParams } from "url";
import Joi from "joi";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";

export const findRouter = express.Router();

findRouter.post("*", (req: Request, res: Response, next: NextFunction) => {
  req.session.answers ??= {};
  res.locals.csrfToken = req?.csrfToken?.() ?? "";
  next();
});

findRouter.get("*", (req: Request, res: Response, next: NextFunction) => {
  res.locals.path = req.path;
  req.session.answers ??= {};
  res.locals.csrfToken = req?.csrfToken?.() ?? "";

  next();
});

function normaliseServiceType(serviceType: string) {
  return kebabCase(serviceType.toLowerCase());
}
findRouter.param("serviceType", (req: Request, res: Response, next: NextFunction, serviceType) => {
  try {
    const normalisedServiceType = normaliseServiceType(serviceType);
    const schema = Joi.string().allow("lawyers", "funeral-directors", "translators-interpreters");
    const { error } = schema.validate(normalisedServiceType);
    if (error) {
      throw Error(error.message);
    }

    res.locals.findServiceType = normalisedServiceType;
    res.locals.serviceLabel = getServiceLabel(serviceType);
    res.locals.serviceLabelPlural = serviceName(serviceType);
  } catch (e) {
    logger.error(`User requested ${serviceType} but it was not recognised`);
    throw new HttpException(404, "404", " ");
  }

  res.locals.removeQueryParameter = removeQueryParameter;
  res.locals.getParameterValue = getParameterValue;

  next();
});

findRouter.param("country", (req: Request, res: Response, next: NextFunction, country) => {
  res.locals.urlSafeCountry = encodeURIComponent(country.toLowerCase());
  res.locals.country = decodeURIComponent(country);

  next();
});

findRouter.get("/:serviceType", handlers.serviceType.get);
findRouter.get("/:serviceType/*", (req: Request, res: Response, next: NextFunction) => {
  const { serviceType } = req.params;

  const sessionAnswers = req.session.answers ?? {};

  const answers = {
    country: sessionAnswers.country ?? req.params.country,
    region: sessionAnswers.region ?? req.query.region,
    practiceAreas: sessionAnswers.practiceAreas ?? req.query["practice-area"],
    serviceType,
  };

  res.locals.answers = answers;

  // @ts-ignore
  const query = new URLSearchParams(req.query);
  res.locals.queryString = query.toString();
  res.locals.serviceType = serviceType;

  next();
});

findRouter.get("/:serviceType/country", handlers.country.get);
findRouter.post("/:serviceType/country", handlers.country.post);

findRouter.get("/:serviceType/*", (req: Request, res: Response, next: NextFunction) => {
  const { serviceType } = req.params;

  res.locals.answers = req.session.answers;

  // @ts-ignore
  const query = new URLSearchParams(req.query);
  res.locals.queryString = query.toString();
  res.locals.serviceType = serviceType;

  next();
});

findRouter.get("/lawyers/:country", handlers.country.get);
findRouter.post("/lawyers/:country", handlers.country.post);
findRouter.get("/lawyers/:country/region", handlers.region.get);

findRouter.get("/:serviceType/:country/disclaimer", handlers.disclaimer.get);
findRouter.post("/:serviceType/:country/disclaimer", handlers.disclaimer.post);
findRouter.get("/:serviceType/:country/result", handlers.result.get);

findRouter.post("/lawyers/:country/region", handlers.region.post);

findRouter.get("/lawyers/:country/practice-areas", handlers.practiceAreas.get);
findRouter.post("/lawyers/:country/practice-areas", handlers.practiceAreas.post);

findRouter.get("/funeral-directors/insurance", handlers.insurance.get);
findRouter.get("/funeral-directors/insurance/contact-insurance", handlers.contactInsurance.get);
findRouter.get("/funeral-directors/insurance/repatriation", handlers.repatriation.get);
findRouter.get("/funeral-directors/country", handlers.country.get);
findRouter.get("/funeral-directors/country", handlers.country.post);
findRouter.get("/funeral-directors/:country/region", handlers.region.get);
findRouter.get("/funeral-directors/:country/disclaimer", handlers.disclaimer.get);
