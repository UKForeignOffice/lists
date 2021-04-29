import { NextFunction, Request, Response } from "express";
import { countryHasLawyers } from "server/models/helpers";
import { lawyers, types as modelTypes } from "server/models";
import { trackListsSearch } from "server/services/google-analytics";
import { DEFAULT_VIEW_PROPS, listsRoutes } from "./constants";
import {
  lawyersGetController,
  lawyersApplicationIngestionController,
} from "./lawyers";
import {
  getAllRequestParams,
  regionFromParams,
  queryStringFromParams,
  getCountryLawyerRedirectLink,
  practiceAreaFromParams,
  removeQueryParameter,
  getServiceLabel,
} from "./helpers";

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

export async function listsResultsController(
  req: Request,
  res: Response
): Promise<void> {
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

  let searchResults: modelTypes.Lawyer[];

  switch (serviceType) {
    case "lawyers":
      searchResults = await lawyers.findPublishedLawyersPerCountry({
        country,
        region,
        legalAid,
        practiceArea,
      });
      break;
    default:
      searchResults = [];
  }

  res.render("lists/results-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
  });
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

export function professionalApplicationIngestionController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { serviceType } = req.params;

  switch (serviceType) {
    case "lawyers":
      lawyersApplicationIngestionController(req, res, next);
      break;
    default:
      res.status(500).send({
        error:
          "Service Type is incorrect, please make sure form's output configuration is correct",
      });
  }
}
