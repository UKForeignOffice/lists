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
  getLinksOfOtherServices,
} from "../helpers";
import { QuestionName } from "../types";
import { getCSRFToken } from "server/components/cookies/helpers";
import { LawyerListItem } from "server/models/listItem/providers";
import { CountryName, LawyerListItemGetObject } from "server/models/types";
import { cleanLegalPracticeAreas, validateCountry } from "server/models/listItem/providers/helpers";
import { logger } from "server/services/logger";

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
  let countryName: string | undefined = formatCountryParam(country as string);
  params = { ...params, country: countryName as CountryName };
  countryName = validateCountry(countryName);

  let { page = "1" } = params;
  page = page !== "" ? page : "1";
  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  let allRows: LawyerListItemGetObject[] = [];
  let practiceArea: string[] | undefined = [];
  try {
    practiceArea = parseListValues("practiceArea", params);
    if (practiceArea != null) {
      practiceArea = cleanLegalPracticeAreas(practiceArea);
    }

    if (countryName) {
      allRows = await LawyerListItem.findPublishedLawyersPerCountry({
        countryName,
        region,
        practiceArea,
        offset: -1,
      });
    }
  } catch (error) {
    // continue processing with an empty allRows[]
    logger.error(`Exception caught in searchLawyers`, error);
  }
  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: params,
  });

  const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

  let searchResults: LawyerListItemGetObject[] = [];

  if (allRows.length > 0) {
    searchResults = await LawyerListItem.findPublishedLawyersPerCountry({
      countryName,
      region,
      practiceArea,
      offset,
    });
  }
  const results = print === "yes" ? allRows : searchResults;
  const relatedLinks = await getLinksOfOtherServices(country as CountryName, serviceType!);

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
    relatedLinks,
  });
}
