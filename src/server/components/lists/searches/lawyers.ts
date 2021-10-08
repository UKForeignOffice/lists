import { Request, Response } from "express";
import { listItem } from "server/models";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  queryStringFromParams,
  parseListValues,
} from "../helpers";
import { QuestionName } from "../types";

export const lawyersQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.practiceArea,
  QuestionName.legalAid,
  QuestionName.proBono,
  QuestionName.readDisclaimer,
];

export async function searchLawyers(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, country, legalAid, region, proBono } = params;
  const practiceArea = parseListValues("practiceArea", params);

  const searchResults = await listItem.findPublishedLawyersPerCountry({
    countryName: country,
    region,
    legalAid,
    proBono,
    practiceArea,
  });

  res.render("lists/results-page.njk", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
  });
}
