import type { Request, Response, NextFunction } from "express";
import express from "express";
import { kebabCase } from "lodash";
import * as handlers from "./handlers";
import { getServiceLabel } from "server/components/lists";
import serviceName from "server/utils/service-name";
import { getParameterValue, removeQueryParameter } from "server/components/lists/helpers";
import Joi from "joi";
import { HttpException } from "server/middlewares/error-handlers";
import { logger } from "server/services/logger";
import { checkIncompleteState } from "./middleware/checkIncompleteState";
import { validateCountry } from "server/models/listItem/providers/helpers";
import querystring from "querystring";

export const findRouter = express.Router();

findRouter.all("*", (req: Request, res: Response, next: NextFunction) => {
  req.session.answers ??= {};
  res.locals.csrfToken = req?.csrfToken?.() ?? "";
  next();
});

findRouter.get("/", (req: Request, res: Response) => {
  const serviceType = req.query.serviceType as string;
  const country = validateCountry(req.query.country as string);
  let query = "";
  if (country) {
    query = `?${querystring.encode({ country })}`;
  }

  res.redirect(301, `find/${normaliseServiceType(serviceType)}${query}`);
});

function normaliseServiceType(serviceType: string) {
  return kebabCase(serviceType).toLowerCase();
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
    res.locals.serviceType = serviceType;
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
  res.locals.urlSafeCountry = encodeURIComponent(country);
  res.locals.country = decodeURIComponent(country);
  req.session.answers = {
    ...req.session.answers,
    country,
  };
  res.locals.answers = req.session.answers;

  next();
});

findRouter.param("serviceType", (req: Request, res: Response, next: NextFunction, serviceType) => {
  if (req.query.country) {
    req.session.answers!.country = req.query.country as string;
  }

  res.locals.answers = req.session.answers;
  res.locals.serviceType = serviceType;

  next();
});

findRouter.get("/:serviceType", handlers.serviceType.get);

findRouter.get("/:serviceType/country", handlers.country.get);
findRouter.get("/:serviceType/:country*", handlers.country.redirectIfEmpty);
findRouter.post("/:serviceType/country", handlers.country.post);

findRouter.get("/:serviceType/*", (req: Request, res: Response, next: NextFunction) => {
  const { serviceType } = req.params;
  res.locals.answers = req.session.answers;
  res.locals.serviceType = serviceType;

  next();
});

findRouter.get("/:serviceType/:country/region", handlers.region.get);
findRouter.post("/:serviceType/:country/region", handlers.region.post);

findRouter.get("/:serviceType/:country/disclaimer", handlers.disclaimer.get);
findRouter.post("/:serviceType/:country/disclaimer", handlers.disclaimer.post);
findRouter.get("/:serviceType/:country/result", checkIncompleteState, handlers.result.get);
findRouter.get("/:serviceType/:country/practice-areas", handlers.practiceAreas.get);
findRouter.post("/:serviceType/:country/practice-areas", handlers.practiceAreas.post);

findRouter.get("/:serviceType/insurance", handlers.insurance.get);
findRouter.post("/:serviceType/insurance", handlers.insurance.post);
findRouter.get("/:serviceType/insurance/contact-insurance", handlers.contactInsurance.get);
findRouter.get("/:serviceType/repatriation", handlers.repatriation.get);
findRouter.post("/:serviceType/repatriation", handlers.repatriation.post);

findRouter.get("/:serviceType/:country/services", handlers.translatorsInterpreters.services.get);
findRouter.post("/:serviceType/:country/services", handlers.translatorsInterpreters.services.post);

findRouter.get("/:serviceType/:country/languages", handlers.translatorsInterpreters.languages.get);
findRouter.post("/:serviceType/:country/languages", handlers.translatorsInterpreters.languages.post);
findRouter.get("/:serviceType/:country/languages/summary", handlers.translatorsInterpreters.languagesSummary.get);

findRouter.get("/:serviceType/:country/types", handlers.translatorsInterpreters.types.get);
findRouter.post("/:serviceType/:country/types", handlers.translatorsInterpreters.types.post);
