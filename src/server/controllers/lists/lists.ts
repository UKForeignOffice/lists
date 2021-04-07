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
  countryHasLegalAid,
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

  const { country } = params;

  if (region !== undefined) {
    params.region = region;
  }

  const queryString = queryStringFromParams(params);

  if (country !== undefined && country !== "" && !countryHasLawyers(country)) {
    // data hasn't been migrated, redirect user to legacy FCDO pages
    const pageUrl = getCountryLawyerRedirectLink(country);
    if (pageUrl !== undefined) {
      return res.redirect(pageUrl);
    }
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

  let questionToRender;
  let error: { field?: string; text?: string; href?: string } = {};

  if (readNotice === undefined) {
    questionToRender = "lawyer-start-page.html";
  } else if (country === undefined || country === "") {
    questionToRender = "question-country.html";
    if (country === "") {
      error = {
        field: "country",
        text: "Country field is not allowed to be empty",
        href: "#country-autocomplete",
      };
    }
  } else if (region === undefined || region === "") {
    questionToRender = "question-region.html";
    if (region === "") {
      error = {
        field: "region",
        text: "Area field is not allowed to be empty",
        href: "#area",
      };
    }
  } else if (practiceArea === undefined || practiceArea?.length === 0) {
    questionToRender = "question-practice-area.html";

    if (practiceArea?.join("") === "") {
      error = {
        field: "practice-area",
        text: "Practice area is not allowed to be empty",
        href: "#practice-area-bankruptcy",
      };
    }
  } else if (
    (legalAid === undefined || legalAid === "") &&
    countryHasLegalAid(country)
  ) {
    questionToRender = "question-legal-aid.html";
    if (legalAid === "") {
      error = {
        field: "legal-aid",
        text: "Legal aid is not allowed to be empty",
        href: "#legal-aid",
      };
    }
  } else if (readDisclaimer === undefined || readDisclaimer === "") {
    questionToRender = "question-disclaimer.html";
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
    questionToRender,
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
      questionToRender: "question-service-type.html",
      serviceLabel: getServiceLabel(serviceType),
    });
  } else if (serviceType === "lawyers") {
    lawyersGetController(req, res);
  }
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
