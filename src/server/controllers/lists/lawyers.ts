import { NextFunction, Request, Response } from "express";
import { startCase } from "lodash";
import { DEFAULT_VIEW_PROPS, listsRoutes } from "./constants";
import { legalPracticeAreasList } from "server/services/metadata";
import {
  countryHasLegalAid,
  getAllRequestParams,
  getServiceLabel,
  needToAnswerCountry,
  needToAnswerLegalAid,
  needToAnswerPracticeArea,
  needToAnswerRegion,
  needToReadDisclaimer,
  needToReadNotice,
  practiceAreaFromParams,
  queryStringFromParams,
  removeQueryParameter,
} from "./helpers";

export function lawyersGetController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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
    partialPageTitle = "Which country do you need a lawyer in?";
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
    res.redirect(`${listsRoutes.results}?${queryString}`);
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

export function lawyersApplicationIngestionController(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.json({ reference: 123 });
}
