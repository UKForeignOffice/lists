import _ from "lodash";
import { Request, Response } from "express";
import { countriesList, legalPracticeAreasList } from "services/metadata";
import {
  getAllRequestParams,
  regionFromParams,
  queryStringFromParams,
  getCountryLawyerRedirectLink,
  practiceAreaFromParams,
  removeQueryParameter,
  getServiceLabel,
} from "./helpers";

import { countryHasLawyers } from "server/models/helpers";
import { lawyers, types as modelTypes } from "server/models";

export const listsFinderStartRoute = "/";
export const listsFinderFormRoute = "/find";
export const listsFinderResultsRoute = "/results";

const DEFAULT_VIEW_PROPS = {
  _,
  countriesList,
  serviceName: "Lists",
  legalPracticeAreasList,
  listsFinderFormRoute,
};

// Controllers

export function listsFinderStartPageController(
  req: Request,
  res: Response
): void {
  return res.render("lists/start-page", {
    nextRoute: listsFinderFormRoute,
    previousRoute: listsFinderStartRoute,
  });
}

export function listsFinderPostController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);
  const region = regionFromParams(params);

  if (region !== undefined) {
    params.region = region;
  }

  const queryString = queryStringFromParams(params);
  const { country } = params;

  if (country !== undefined && !countryHasLawyers(country)) {
    // data hasn't been migrated, redirect user to legacy FCDO pages
    const pageUrl = getCountryLawyerRedirectLink(country);
    if (pageUrl !== undefined) {
      return res.redirect(pageUrl);
    }
  }

  res.redirect(`${DEFAULT_VIEW_PROPS.listsFinderFormRoute}?${queryString}`);
}

export function listsFinderGetController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);

  const {
    serviceType,
    country,
    legalAid,
    readNotice,
    readDisclaimer,
    region,
  } = params;

  const practiceArea = practiceAreaFromParams(params);

  if (practiceArea !== undefined) {
    params.practiceArea = practiceArea;
  }

  const queryString = queryStringFromParams(params);
  const isSearchingForLawyers = serviceType === "lawyers";

  let questionToRender;

  if (serviceType === undefined) {
    questionToRender = "question-service-type.html";
  } else if (readNotice === undefined) {
    questionToRender = isSearchingForLawyers
      ? "lawyer-start-page.html"
      : "medical-facilities-start-page.html";
  } else if (country === undefined) {
    questionToRender = "question-country.html";
  } else if (region === undefined) {
    questionToRender = "question-region.html";
  } else if (practiceArea === undefined && isSearchingForLawyers) {
    questionToRender = "question-practice-area.html";
  } else if (legalAid === undefined && isSearchingForLawyers) {
    questionToRender = "question-legal-aid.html";
  } else if (readDisclaimer === undefined) {
    questionToRender = "question-disclaimer.html";
  } else {
    // all processed, redirect to result route
    res.redirect(`${listsFinderResultsRoute}?${queryString}`);
    return;
  }

  res.render("lists/question-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    queryString,
    questionToRender,
    removeQueryParameter,
    serviceLabel: getServiceLabel(serviceType),
  });
}

export async function listsFinderResultsController(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, country, legalAid, region } = params;
  const practiceArea = practiceAreaFromParams(params);

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

  res.redirect(`${listsFinderFormRoute}?${queryString}`);
}
