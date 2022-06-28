import { Request, Response } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { FuneralDirectorListItem } from "server/models/listItem/providers";

export const funeralDirectorsQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.sameCountry,
  QuestionName.country,
  QuestionName.region,
  QuestionName.repatriation,
  QuestionName.readDisclaimer,
];

export async function searchFuneralDirectors(
  req: Request,
  res: Response
): Promise<void> {
  const params = getAllRequestParams(req);
  const { serviceType, sameCountry, country, region, repatriation, print = "no" } = params;
  let { page = "1" } = params;
  page = page !== "" ? page : "1";

  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  const filterProps = {
    countryName: sameCountry?.includes("yes") ? country : "United Kingdom",
    region,
    repatriation: repatriation?.includes("yes") ?? false,
    offset: -1,
  };

  const allRows = await FuneralDirectorListItem.findPublishedFuneralDirectorsPerCountry(filterProps);
  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: params,
  });

  const offset =
    ROWS_PER_PAGE * pagination.results.currentPage -
    ROWS_PER_PAGE;

  filterProps.offset = offset;

  const searchResults = await FuneralDirectorListItem.findPublishedFuneralDirectorsPerCountry(filterProps);

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
