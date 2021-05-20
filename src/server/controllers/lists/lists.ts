import { NextFunction, Request, Response } from "express";
import { countryHasLawyers } from "server/models/helpers";
import { trackListsSearch } from "server/services/google-analytics";
import { DEFAULT_VIEW_PROPS, listsRoutes } from "./constants";
import { listItem } from "server/models";
import {
  searchLawyers,
  lawyersGetController,
  lawyersDataIngestionController,
} from "./lawyers";
import {
  getServiceLabel,
  regionFromParams,
  getAllRequestParams,
  queryStringFromParams,
  practiceAreaFromParams,
  getCountryLawyerRedirectLink,
} from "./helpers";
import { logger } from "server/services/logger";

export function listsStartPageController(req: Request, res: Response): void {
  return res.render("lists/start-page", {
    nextRoute: listsRoutes.finder,
    previousRoute: listsRoutes.start,
  });
}

export function listsPostController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);
  const region = regionFromParams(params);

  const { country, serviceType } = params;

  if (region !== undefined) {
    params.region = region;
  }

  const queryString = queryStringFromParams(params);

  if (country !== undefined && country !== "" && !countryHasLawyers(country)) {
    // data hasn't been migrated, redirect user to legacy FCDO pages
    trackListsSearch({
      serviceType,
      country,
    });

    return res.redirect(getCountryLawyerRedirectLink(country));
  }

  res.redirect(`${listsRoutes.finder}?${queryString}`);
}

export function listsGetController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const params = getAllRequestParams(req);

  const { serviceType } = params;

  if (serviceType === undefined) {
    res.render("lists/question-page.html", {
      ...DEFAULT_VIEW_PROPS,
      ...params,
      partialToRender: "question-service-type.html",
      serviceLabel: getServiceLabel(serviceType),
    });
  } else if (serviceType === "lawyers") {
    lawyersGetController(req, res, next);
  }
}

export function listsResultsController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const params = getAllRequestParams(req);
  const { serviceType, country, legalAid, region } = params;
  const practiceArea = practiceAreaFromParams(params);

  trackListsSearch({
    serviceType,
    country,
    region,
    practiceArea: practiceArea?.join(","),
    legalAid,
  });

  switch (serviceType) {
    case "lawyers":
      searchLawyers(req, res, next).catch((error) =>
        logger.error("Lists Result Controller", { error })
      );
      break;
    default:
      next();
  }
}

export function listRedirectToLawyersController(
  req: Request,
  res: Response
): void {
  const params = getAllRequestParams(req);
  params.serviceType = "lawyers";
  const queryString = queryStringFromParams(params);

  res.redirect(`${listsRoutes.finder}?${queryString}`);
}

export function listsDataIngestionController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { serviceType } = req.params;

  switch (serviceType) {
    case "lawyers":
      lawyersDataIngestionController(req, res, next);
      break;
    default:
      res.status(500).send({
        error:
          "Service Type is incorrect, please make sure form's webhook output configuration is correct",
      });
  }
}

export function listsConfirmApplicationController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { reference } = req.params;
  listItem
    .setEmailIsVerified({ reference })
    .then(() => res.render("lists/application-confirmation-page.html"))
    .catch(next);
}
