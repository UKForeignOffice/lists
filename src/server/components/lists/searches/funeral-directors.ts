import { Request, Response } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { DEFAULT_VIEW_PROPS } from "../constants";
import {
  getServiceLabel,
  getAllRequestParams,
  removeQueryParameter,
  getParameterValue,
  queryStringFromParams,
  formatCountryParam,
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { FuneralDirectorListItem } from "server/models/listItem/providers";
import { CountryName } from "server/models/types";
import { logger } from "server/services/logger";

export const funeralDirectorsQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.insurance,
  QuestionName.contactInsurance,
  QuestionName.repatriation,
  QuestionName.country,
  QuestionName.region,
  QuestionName.readDisclaimer,
];

export async function searchFuneralDirectors(
  req: Request,
  res: Response
): Promise<void> {
  try {
    let params = getAllRequestParams(req);
    const { serviceType, country, region, repatriation, print = "no" } = params;
    const countryName = formatCountryParam(country as string);
    params = { ...params, country: countryName as CountryName };

    let { page = "1" } = params;
    page = page !== "" ? page : "1";

    const pageNum = parseInt(page);
    params.page = pageNum.toString();

    const filterProps = {
      countryName,
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

    const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

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
  } catch (error) {
    logger.error(`searchFuneralDirectors Error: ${(error as Error).message}`);
  }
}
