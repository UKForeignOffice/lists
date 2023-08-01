import type { Request } from "express";
import { getPaginationValues, ROWS_PER_PAGE } from "server/models/listItem/pagination";
import { getLinksOfRelatedLists, getServiceLabel } from "../helpers";
import { FuneralDirectorListItem } from "server/models/listItem/providers";
import type { CountryName, FuneralDirectorListItemGetObject } from "server/models/types";
import { validateCountryLower } from "server/models/listItem/providers/helpers";
import { getRelatedLinks } from "server/components/lists/searches/helpers/getRelatedLinks";
import { ServiceType } from "shared/types";

export async function searchFuneralDirectors(req: Request) {
  const { answers = {} } = req.session;
  const { country, serviceType, region, repatriation } = answers;
  const { print = "no", page = 1 } = req.query;
  const pageNum = parseInt(page as string);

  const filterProps = {
    countryName: validateCountryLower(country),
    region,
    ...(repatriation && { repatriation }),
    offset: -1,
  };

  let allRows: FuneralDirectorListItemGetObject[] = [];
  allRows = await FuneralDirectorListItem.findPublishedFuneralDirectorsPerCountry(filterProps);
  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
  });

  const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

  filterProps.offset = offset;

  let searchResults: FuneralDirectorListItemGetObject[] = [];
  if (allRows.length > 0) {
    searchResults = await FuneralDirectorListItem.findPublishedFuneralDirectorsPerCountry(filterProps);
  }
  const results = print === "yes" ? allRows : searchResults;

  const relatedLinks = [
    ...(await getRelatedLinks(country!, ServiceType.funeralDirectors)),
    ...(await getLinksOfRelatedLists(country as CountryName, ServiceType.funeralDirectors)),
  ];

  return {
    searchResults: results,
    serviceLabel: getServiceLabel(serviceType),
    limit: ROWS_PER_PAGE,
    offset,
    pagination,
    print,
    relatedLinks,
  };
}
