import querystring from "querystring";
import _, { isArray, omit, upperFirst, isString } from "lodash";
import { Request, Response } from "express";
import {
  countriesList,
  legalPracticeAreasList,
  fcdoLawyersPagesByCountry,
} from "services/metadata";

import { countryHasLawyers } from "server/models/helpers";
import { db } from "server/models";

export const listsFinderStartRoute = "/";
export const listsFinderFormRoute = "/find";
export const listsFinderResultsRoute = "/results";

interface AllParams {
  serviceType?: string;
  country?: string;
  region?: string;
  practiceArea?: string | string[];
  legalAid?: "yes" | "no";
  readNotice?: string;
  readDisclaimer?: string;
}

const DEFAULT_VIEW_PROPS = {
  _,
  countriesList,
  serviceName: "Lists",
  legalPracticeAreasList,
  listsFinderFormRoute,
};

// Helpers

function queryStringFromParams(params: AllParams): string {
  return Object.keys(params)
    .map((key) => {
      let value: string = params[key];

      if (isArray(value)) {
        value = value.toString();
      }

      return `${key}=${value}`;
    })
    .join("&");
}

function practiceAreaFromParams(params: AllParams): string[] | undefined {
  if (!("practiceArea" in params)) {
    return undefined;
  }

  const { practiceArea } = params;

  if (isArray(practiceArea)) {
    return practiceArea;
  }

  if (isString(practiceArea)) {
    return [practiceArea];
  }
}

function getServiceLabel(serviceType: string | undefined): string {
  return serviceType === "lawyers" ? "a lawyer" : "medical assistance";
}

function getAllRequestParams(req: Request): AllParams {
  return {
    ...req.query,
    ...req.body,
    ...req.params,
  };
}

function removeQueryParameter(
  queryString: string,
  parameterName: string
): string {
  const params = omit(querystring.parse(queryString), parameterName);
  return `${querystring.stringify(params)}`;
}

function getCountryLawyerRedirectLink(countryName: string): string | undefined {
  return (
    fcdoLawyersPagesByCountry[upperFirst(countryName)] ??
    "https://www.gov.uk/government/collections/list-of-lawyers"
  );
}

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
  const queryString = queryStringFromParams(params);
  const { serviceType } = params;

  let searchResults;

  switch (serviceType) {
    case "lawyers":
      searchResults = await db.Lawyers.findPublishedLawyersPerCountry(params);
      break;
    default:
      searchResults = [];
  }

  res.render("lists/results-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    queryString,
    searchResults: searchResults,
    removeQueryParameter,
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
