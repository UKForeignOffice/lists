import { Request, Response } from "express";
import { listItem } from "server/models";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
  parseListValues,
} from "../helpers";
import { QuestionName } from "../types";

export const lawyersQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.practiceArea,
  QuestionName.readDisclaimer,
];

export async function searchLawyers(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, country, region, print = "no"} = params;
  let { page = "1" } = params;
  page = page !== "" ? page : "1";
  let practiceArea = parseListValues("practiceArea", params);
  if (practiceArea != null) {
    practiceArea = practiceArea.map((area) => area.toLowerCase());
  }
  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  const allRows = await listItem.findPublishedLawyersPerCountry({
    countryName: country,
    region,
    practiceArea,
    limit: -1,
    offset: -1,
  });
  const count = allRows.length;

  const { pagination } = await listItem.getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: params,
  });

  const limit = 20;
  const offset = limit * pagination.results.currentPage - limit;

  const searchResults = await listItem.findPublishedLawyersPerCountry({
    countryName: country,
    region,
    practiceArea,
    limit,
    offset,
  });

  const results = (print === "yes") ? allRows : searchResults;

  res.render("lists/results-page", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: results,
    removeQueryParameter,
    getParameterValue,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
    limit,
    offset,
    pagination,
    print
  });

}
