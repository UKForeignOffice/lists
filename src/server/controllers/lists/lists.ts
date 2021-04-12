import _, { startCase } from "lodash";
import { Request, Response } from "express";
import { countriesList, legalPracticeAreasList } from "server/services/metadata";
import { trackListsSearch } from "server/services/google-analytics";
import {
  getAllRequestParams,
  regionFromParams,
  queryStringFromParams,
  getCountryLawyerRedirectLink,
  practiceAreaFromParams,
  removeQueryParameter,
  getServiceLabel,
  countryHasLegalAid,
  needToReadNotice,
  needToAnswerCountry,
  needToAnswerRegion,
  needToAnswerPracticeArea,
  needToAnswerLegalAid,
  needToReadDisclaimer,
} from "./helpers";

import { countryHasLawyers } from "server/models/helpers";
import { lawyers, types as modelTypes } from "server/models";

export const listsFinderStartRoute = "/";
export const listsFinderFormRoute = "/find";
export const listsFinderResultsRoute = "/results";

const DEFAULT_VIEW_PROPS = {
  _,
  countriesList,
  listsFinderFormRoute,
};

// Controllers

export function listsStartPageController(req: Request, res: Response): void {
  return res.render("lists/start-page", {
    nextRoute: listsFinderFormRoute,
    previousRoute: listsFinderStartRoute,
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

  res.redirect(`${DEFAULT_VIEW_PROPS.listsFinderFormRoute}?${queryString}`);
}

export function lawyersGetController(req: Request, res: Response): void {
  const params = getAllRequestParams(req);

  const {
    region,
    country,
    legalAid,
    readNotice,
    serviceType,
    readDisclaimer,
  } = params;

  const practiceArea = practiceAreaFromParams(params);

  if (practiceArea !== undefined) {
    params.practiceArea = practiceAreaFromParams(params);
  }

  const queryString = queryStringFromParams(params);

  let partialPageTitle: string;
  let partialToRender: string;
  let error: { field?: string; text?: string; href?: string } = {};

  if (needToReadNotice(readNotice)) {
    partialToRender = "lawyers-start-page.html";
    partialPageTitle = needToAnswerCountry(country)
      ? "Find a Lawyer Abroad"
      : `Find a Lawyer in ${startCase(country)}`;
  } else if (needToAnswerCountry(country)) {
    partialToRender = "question-country.html";
    partialPageTitle = "Which country do you need a lawyer from?";
    if (country === "") {
      error = {
        field: "country",
        text: "Country field is not allowed to be empty",
        href: "#country-autocomplete",
      };
    }
  } else if (needToAnswerRegion(region)) {
    partialToRender = "question-region.html";
    partialPageTitle = `Which area in ${startCase(
      country
    )} do you need a lawyer from?`;
    if (region === "") {
      error = {
        field: "region",
        text: "Area field is not allowed to be empty",
        href: "#area",
      };
    }
  } else if (needToAnswerPracticeArea(practiceArea)) {
    partialToRender = "question-practice-area.html";
    partialPageTitle = "In which field of law do you need legal help?";
    if (practiceArea?.join("") === "") {
      error = {
        field: "practice-area",
        text: "Practice area is not allowed to be empty",
        href: "#practice-area-bankruptcy",
      };
    }
  } else if (needToAnswerLegalAid(legalAid) && countryHasLegalAid(country)) {
    partialToRender = "question-legal-aid.html";
    partialPageTitle = "Are you interested in legal aid?";
    if (legalAid === "") {
      error = {
        field: "legal-aid",
        text: "Legal aid is not allowed to be empty",
        href: "#legal-aid",
      };
    }
  } else if (needToReadDisclaimer(readDisclaimer)) {
    partialToRender = "question-disclaimer.html";
    partialPageTitle = "Disclaimer";
    if (readDisclaimer === "") {
      error = {
        field: "read-disclaimer",
        text: "Disclaimer is not allowed to be empty",
        href: "#read-disclaimer",
      };
    }
  } else {
    // all processed, redirect to result route
    res.redirect(`${listsFinderResultsRoute}?${queryString}`);
    return;
  }

  res.render("lists/question-page.html", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    error,
    queryString,
    partialToRender,
    partialPageTitle,
    removeQueryParameter,
    legalPracticeAreasList,
    serviceLabel: getServiceLabel(serviceType),
  });
}

export function listsGetController(req: Request, res: Response): void {
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
    lawyersGetController(req, res);
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

  res.redirect(`${listsFinderFormRoute}?${queryString}`);
}
