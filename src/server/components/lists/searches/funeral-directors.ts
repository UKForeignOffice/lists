import type { Request } from "express";
import { ROWS_PER_PAGE, getPaginationValues } from "server/models/listItem/pagination";
import { getServiceLabel, getAllRequestParams, formatCountryParam, getLinksOfRelatedLists } from "../helpers";
import { FuneralDirectorListItem } from "server/models/listItem/providers";
import type { CountryName, FuneralDirectorListItemGetObject } from "server/models/types";
import { validateCountry } from "server/models/listItem/providers/helpers";
import { getRelatedLinks } from "server/components/lists/searches/helpers/getRelatedLinks";
import { getDbServiceTypeFromParameter } from "server/components/lists/searches/helpers/getDbServiceTypeFromParameter";

export async function searchFuneralDirectors(req: Request) {
  let params = getAllRequestParams(req);
  const { country, region, repatriation, print = "no" } = params;
  const serviceType = getDbServiceTypeFromParameter(params.serviceType!);
  let countryName: string | undefined = formatCountryParam(country as string);
  countryName = validateCountry(countryName);

  params = { ...params, country: countryName as CountryName };

  let { page = "1" } = params;
  page = page !== "" ? page : "1";

  const pageNum = parseInt(page);
  params.page = pageNum.toString();

  const filterProps = {
    countryName,
    region,
    repatriation: repatriation?.toLowerCase?.() === "yes",
    offset: -1,
  };

  let allRows: FuneralDirectorListItemGetObject[] = [];
  if (countryName) {
    allRows = await FuneralDirectorListItem.findPublishedFuneralDirectorsPerCountry(filterProps);
  }
  const count = allRows.length;

  const { pagination } = await getPaginationValues({
    count,
    page: pageNum,
    listRequestParams: params,
  });

  const offset = ROWS_PER_PAGE * pagination.results.currentPage - ROWS_PER_PAGE;

  filterProps.offset = offset;

  let searchResults: FuneralDirectorListItemGetObject[] = [];
  if (allRows.length > 0) {
    searchResults = await FuneralDirectorListItem.findPublishedFuneralDirectorsPerCountry(filterProps);
  }
  const results = print === "yes" ? allRows : searchResults;

  const relatedLinks = [
    ...(await getRelatedLinks(countryName!, serviceType)),
    ...(await getLinksOfRelatedLists(country as CountryName, serviceType)),
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
