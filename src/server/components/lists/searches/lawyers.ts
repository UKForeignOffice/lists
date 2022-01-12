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
import { ListsRequestParams, PaginationItem, PaginationResults, QuestionName } from "../types";
import { listsRoutes } from "server/components/lists";

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
  let { serviceType, country, legalAid, region, proBono, page } = params;
  let practiceArea = parseListValues("practiceArea", params);
  if (practiceArea != null) {
    practiceArea = practiceArea.map(area => area.toLowerCase());
  }
  if (page == null) {
    page = 1
  }

  const { pagination } = await getPaginationValues({
    country,
    region,
    legalAid,
    proBono,
    practiceArea,
    page,
    params
  })

  const limit = 20;
  const offset = (limit * pagination.results.currentPage) - limit;

  const searchResults = await listItem.findPublishedLawyersPerCountry({
    countryName: country,
    region,
    legalAid,
    proBono,
    practiceArea,
    limit,
    offset
  });

  res.render("lists/results-page", {
    ...DEFAULT_VIEW_PROPS,
    ...params,
    searchResults: searchResults,
    removeQueryParameter,
    queryString: queryStringFromParams(params),
    serviceLabel: getServiceLabel(serviceType),
    limit,
    offset,
    pagination
  });
}

export async function getPaginationValues(  props: {
  country?: string;
  region?: string;
  legalAid?: "yes" | "no" | "";
  proBono?: "yes" | "no" | "";
  practiceArea?: string[];
  page?: number;
  params?: ListsRequestParams;
}): Promise<PaginationResults> {
  const {country, region, legalAid, proBono, practiceArea} = props;
  let {page, params} = props;
  const allRows = await listItem.findPublishedLawyersPerCountry({
    countryName: country,
    region,
    legalAid,
    proBono,
    practiceArea,
    limit: -1,
    offset: -1
  });

  const count = allRows.length;
  if (params === undefined) params = {}
  let from = 0;
  let to = 0;
  let allPages = 0;
  const limit = 20;
  const pageItems: PaginationItem[] = [];
  if (count > 0 && limit !== undefined && limit > 0) {
    allPages = Math.ceil(count / limit);
  }

  // set prev and next page links
  let currentPage = page === undefined ? 1 : Number(page);
  let queryString = queryStringFromParams(params);
  queryString = queryString.replace("&page=" + currentPage.toString(), "")
  let queryStringPrevious = "";
  let queryStringNext = "";
  let previousPage = -1;
  let nextPage = -1;
  if (currentPage > allPages) {
    currentPage = allPages;
  }

  if (currentPage > 1) {
    previousPage = currentPage - 1;
    queryStringPrevious = `${listsRoutes.results}?${queryString}&page=${previousPage}`;
  }
  if (currentPage < allPages) {
    nextPage = currentPage + 1;
    queryStringNext = `${listsRoutes.results}?${queryString}&page=${nextPage}`;
  }

  // set page items
  for (let i = 1; i <= allPages; i++) {
    let href = "";
    if (i >= currentPage-2 && i <= currentPage+2) {

      if (i !== currentPage) {
        href = `${listsRoutes.results}?${queryString}&page=${i}`
      }
      pageItems.push({
        text: (i).toString(),
        href
      });
    }
  }

  // determine from count
  if (count === 0) {
    from = 0;

  } else if (count < limit) {
    from = (limit * currentPage) - (count - 1);

  } else {
    from = (limit * currentPage) - (limit - 1);
  }

  // determine to count
  if (currentPage === allPages) {
    to = count;

  } else {
    to = limit * currentPage;
  }

  return {
    pagination: {
      results: {
        from,
        to,
        count,
        currentPage
      },
      previous: {
        text: previousPage.toString(),
        href: queryStringPrevious
      },
      next: {
        text: nextPage.toString(),
        href: queryStringNext
      },
      items: pageItems
    }
  }
}
