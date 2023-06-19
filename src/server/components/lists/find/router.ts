import type { Request, Response, NextFunction } from "express";
import express from "express";
import { kebabCase } from "lodash";
import * as serviceType from "./handers/service-type";
import * as country from "./handers/country";
import * as region from "./handers/region";
import * as practiceAreas from "./handers/practice-areas";
import * as disclaimer from "./handers/disclaimer";
import * as result from "./handers/result";
import { getServiceLabel } from "server/components/lists";
import serviceName from "server/utils/service-name";
import { getParameterValue, removeQueryParameter } from "server/components/lists/helpers";
import { URLSearchParams } from "url";

export const findRouter = express.Router();

findRouter.post("*", (req: Request, res: Response, next: NextFunction) => {
  req.session.answers ??= {};
  res.locals.csrfToken = req?.csrfToken?.() ?? "";
  next();
});

findRouter.get("*", (req: Request, res: Response, next: NextFunction) => {
  res.locals.path = req.path;
  req.session.answers ??= {};

  next();
});

function normaliseServiceType(serviceType: string) {
  return kebabCase(serviceType.toLowerCase());
}
findRouter.param("serviceType", (req: Request, res: Response, next: NextFunction, serviceType) => {
  res.locals.findServiceType = normaliseServiceType(serviceType);
  res.locals.serviceLabel = getServiceLabel(serviceType);
  res.locals.serviceLabelPlural = serviceName(serviceType);
  res.locals.removeQueryParameter = removeQueryParameter;
  res.locals.getParameterValue = getParameterValue;
  next();
});

findRouter.param("country", (req: Request, res: Response, next: NextFunction, country) => {
  res.locals.urlSafeCountry = encodeURIComponent(country.toLowerCase());
  res.locals.country = decodeURIComponent(country);
  next();
});

findRouter.get("/:serviceType", serviceType.get);
findRouter.get("/:serviceType/country", country.get);
findRouter.post("/:serviceType/country", country.post);
findRouter.get("/:serviceType/:country*", (req: Request, res: Response, next: NextFunction) => {
  const { country, serviceType } = req.params;
  const { region } = req.query;

  const answers = {
    ...req.session.answers,
    country,
    region,
    practiceAreas: req.query["practice-area"],
    serviceType,
  };

  res.locals.answers = answers;

  // @ts-ignore
  const query = new URLSearchParams(req.query);
  res.locals.queryString = query.toString();
  res.locals.serviceType = serviceType;

  next();
});

findRouter.get("/:serviceType/:country", country.get);
findRouter.post("/:serviceType/:country", country.post);
findRouter.get("/:serviceType/:country/region", region.get);
findRouter.post("/:serviceType/:country/region", region.post);

findRouter.get("/lawyers/:country/practice-areas", practiceAreas.get);
findRouter.post("/lawyers/:country/practice-areas", practiceAreas.post);
findRouter.get("/lawyers/:country/disclaimer", disclaimer.get);
findRouter.post("/lawyers/:country/disclaimer", disclaimer.post);
findRouter.get("/lawyers/:country/result", result.get);
