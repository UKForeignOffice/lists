import { Request, Response } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
  parseListValues,
  formatCountryParam,
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { LawyerListItem } from "server/models/listItem/providers";
import { CountryName } from "server/models/types";

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
  let params = getAllRequestParams(req);
  const { serviceType, country, region, print = "no" } = params;
  const countryName = formatCountryParam(country as string);
  params = { ...params, country: countryName as CountryName };
  let { page = "1" } = params;
  page = page !== "" ? page : "1";
  let practiceArea = parseListValues("practiceArea", params);
  if (practiceArea != null) {
    practiceArea = practiceArea.map((area) => area.toLowerCase());
  }
  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  const allRows = await LawyerListItem.findPublishedLawyersPerCountry({
    countryName,
    region,
    practiceArea,
    offset: -1,
  });
  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: params,
  });

  const offset =
    ROWS_PER_PAGE * pagination.results.currentPage -
    ROWS_PER_PAGE;

  const searchResults = await LawyerListItem.findPublishedLawyersPerCountry({
    countryName,
    region,
    practiceArea,
    offset,
  });

  const results = print === "yes" ? allRows : searchResults;

  res.render("lists/results-page", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: results,
    removeQueryParameter,
    getParameterValue,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
    limit: ROWS_PER_PAGE,
    offset,
    pagination,
    print,
    csrfToken: getCSRFToken(req),
  });
}
