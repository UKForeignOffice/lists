import type { Request } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { getLinksOfRelatedLists } from "../helpers";
import { LawyerListItem } from "server/models/listItem/providers";
import type { CountryName, LawyerListItemGetObject } from "server/models/types";
import { logger } from "server/services/logger";
import { getRelatedLinks } from "server/components/lists/searches/helpers/getRelatedLinks";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { sanitisePracticeAreas } from "server/components/lists/find/helpers/sanitisePracticeAreas";
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";

export async function searchLawyers(req: Request) {
  const { answers = {} } = req.session;
  const { country } = answers;
  const { print = "no", page = 1 } = req.query ?? {};
  const pageNum = parseInt(page as string);

  const region = decodeURIComponent(answers.region ?? "");

  const filterProps = {
    countryName: validateCountryLower(country),
    ...(region && { region }),
    practiceArea: sanitisePracticeAreas(answers.practiceAreas ?? []),
    offset: -1,
  };

  let allRows: LawyerListItemGetObject[] = [];

  try {
    allRows = await LawyerListItem.findPublishedLawyersPerCountry(filterProps);
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
    /**
     * TODO: investigate why this runs twice.
     */
    searchResults = await LawyerListItem.findPublishedLawyersPerCountry({
      ...filterProps,
      offset,
    });
  }
  const results = print === "yes" ? allRows : searchResults;
  const type = getDbServiceTypeFromParameter(answers.serviceType!);

  const relatedLinks = [
    ...(await getRelatedLinks(country as CountryName, type)),
    ...(await getLinksOfRelatedLists(country as CountryName, type)),
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
