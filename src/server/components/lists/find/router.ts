import type { NextFunction, Request, Response } from "express";
import express from "express";
import * as handlers from "./handlers";
import { checkIncompleteState } from "./middleware/checkIncompleteState";
import { validateCountry } from "server/models/listItem/providers/helpers";
import querystring from "querystring";
import { initFindSession } from "./middleware/initFindSession";
import { normaliseServiceType } from "server/components/lists/find/helpers/normaliseServiceType";
import { validateServiceTypeParam } from "server/components/lists/find/handlers/params/serviceType";
import { handleCountryParam } from "server/components/lists/find/handlers/params/country";
import { loadAnswersIntoLocals } from "server/components/lists/find/middleware/loadAnswersIntoLocals";
import { getServiceLabel } from "server/components/lists";
import serviceName from "server/utils/service-name";
import { HttpException } from "server/middlewares/error-handlers";
export const findRouter = express.Router();

findRouter.all("*", initFindSession);
findRouter.get("/", redirectQueryServiceName);

findRouter.get("/:serviceType", handlers.serviceType.get);

findRouter.param("serviceType", validateServiceTypeParam);
findRouter.param("serviceType", loadAnswersIntoLocals);

findRouter.param("country", handleCountryParam);
findRouter.param("country", handlers.country.redirectIfEmpty);

findRouter.get("/:serviceType/country", handlers.country.get);
findRouter.all("/funeral-directors/*", loadAnswersIntoLocals, (_req: Request, res: Response, next: NextFunction) => {
  res.locals.serviceType = "funeral-directors";
  res.locals.serviceLabel = getServiceLabel("funeral-directors");
  res.locals.serviceLabelPlural = serviceName("funeral-directors");
  next();
});

findRouter.get("/funeral-directors/insurance", handlers.funeralDirectors.insurance.get);
findRouter.post("/funeral-directors/insurance", handlers.funeralDirectors.insurance.post);
findRouter.get("/funeral-directors/insurance/contact-insurance", handlers.funeralDirectors.contactInsurance.get);
findRouter.get("/funeral-directors/repatriation", handlers.funeralDirectors.repatriation.get);
findRouter.post("/funeral-directors/repatriation", handlers.funeralDirectors.repatriation.post);

findRouter.post("/:serviceType/country", handlers.country.post);

findRouter.get("/:serviceType/:country/region", handlers.region.get);
findRouter.post("/:serviceType/:country/region", handlers.region.post);

findRouter.get("/:serviceType/:country/practice-areas", handlers.lawyers.practiceAreas.get);
findRouter.post("/:serviceType/:country/practice-areas", handlers.lawyers.practiceAreas.post);

findRouter.get("/:serviceType/:country/services", handlers.translatorsInterpreters.services.get);
findRouter.post("/:serviceType/:country/services", handlers.translatorsInterpreters.services.post);

findRouter.get("/:serviceType/:country/languages", handlers.translatorsInterpreters.languages.get);
findRouter.post("/:serviceType/:country/languages", handlers.translatorsInterpreters.languages.post);
findRouter.get("/:serviceType/:country/languages/summary", handlers.translatorsInterpreters.languagesSummary.get);

findRouter.get("/:serviceType/:country/types", handlers.translatorsInterpreters.types.get);
findRouter.post("/:serviceType/:country/types", handlers.translatorsInterpreters.types.post);

findRouter.get("/:serviceType/:country/disclaimer", handlers.disclaimer.get);
findRouter.post("/:serviceType/:country/disclaimer", handlers.disclaimer.post);

findRouter.get("/:serviceType/:country/result", checkIncompleteState, handlers.result.get);

function redirectQueryServiceName(req: Request, res: Response, next: NextFunction) {
  const serviceType = req.query.serviceType as string;
  if (!serviceType) {
    next(new HttpException(404, "404", " "));
    return;
  }
  const country = validateCountry(req.query.country as string | string[]);
  let query = "";
  if (country) {
    query = `?${querystring.encode({ country })}`;
  }

  /**
   * TODO: Change to 301 for the next release cycle after 1.91.0.
   */
  res.redirect(302, `find/${normaliseServiceType(serviceType)}${query}`);
}
