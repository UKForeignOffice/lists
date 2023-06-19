import type { Request } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { getAllRequestParams, getLinksOfRelatedLists } from "../helpers";
import { QuestionName } from "../types";
import { LawyerListItem } from "server/models/listItem/providers";
import type { CountryName, LawyerListItemGetObject } from "server/models/types";
import { logger } from "server/services/logger";
import { getRelatedLinks } from "server/components/lists/searches/helpers/getRelatedLinks";

export const lawyersQuestionsSequence = [
  QuestionName.readNotice,
  QuestionName.country,
  QuestionName.region,
  QuestionName.practiceArea,
  QuestionName.readDisclaimer,
];

export async function searchLawyers(req: Request) {
  const params = getAllRequestParams(req);
  const { serviceType, country, region, print = "no" } = params;

  let { page = "1" } = params;
  page = page !== "" ? page : "1";
  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  let allRows: LawyerListItemGetObject[] = [];
  const practiceArea: string[] | undefined = [];
  try {
    allRows = await LawyerListItem.findPublishedLawyersPerCountry({
      countryName: country,
      region,
      practiceArea,
      offset: -1,
    });
  } catch (error) {
    logger.error(`Exception caught in searchLawyers`, error);
  }
  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: req.query,
  });

  const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

  let searchResults: LawyerListItemGetObject[] = [];

  if (allRows.length > 0) {
    searchResults = await LawyerListItem.findPublishedLawyersPerCountry({
      countryName: country,
      region,
      practiceArea,
      offset,
    });
  }
  const results = print === "yes" ? allRows : searchResults;

  const relatedLinks = [
    ...(await getRelatedLinks(country!, serviceType!)),
    ...(await getLinksOfRelatedLists(country as CountryName, serviceType!)),
  ];

  return {
    searchResults: results,
    limit: ROWS_PER_PAGE,
    offset,
    pagination,
    print,
    relatedLinks,
  };
}
