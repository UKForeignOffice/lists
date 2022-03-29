import {
  ListsRequestParams,
  listsRoutes,
  PaginationItem,
  PaginationResults,
} from "server/components/lists";
import { queryStringFromParams } from "server/components/lists/helpers";

export const ROWS_PER_PAGE: number = 10;
export async function getPaginationValues(props: {
  count: number;
  page: number;
  listRequestParams: ListsRequestParams;
}): Promise<PaginationResults> {
  const { count, page, listRequestParams } = props;
  let pageCount = 0;
  if (count > 0 && ROWS_PER_PAGE > 0) {
    pageCount = Math.ceil(count / ROWS_PER_PAGE);
  }

  const nextPrevious = getNextPrevious({
    page,
    pageCount,
    listRequestParams,
  });
  const { queryString, currentPage } = nextPrevious;

  const pageItems: PaginationItem[] = getPageItems({
    pageCount,
    currentPage,
    queryString,
  });

  const from = getFromCount({ count, currentPage });
  const to = getToCount({
    currentPage,
    pageCount,
    count,
  });

  return {
    pagination: {
      results: {
        from,
        to,
        count,
        currentPage,
      },
      previous: {
        text: nextPrevious.previous.page.toString(),
        href: nextPrevious.previous.queryString,
      },
      next: {
        text: nextPrevious.next.page.toString(),
        href: nextPrevious.next.queryString,
      },
      items: pageItems,
    },
  };
}

interface getPaginationParams {
  pageCount: number;
  page: number;
  listRequestParams: ListsRequestParams;
}

export function getNextPrevious({
  page = 1,
  pageCount,
  listRequestParams,
}: getPaginationParams): {
  queryString: string;
  currentPage: number;
  previous: {
    page: number;
    queryString: string;
  };
  next: {
    page: number;
    queryString: string;
  };
} {
  let currentPage = page;
  let queryStringPrevious = "";
  let queryStringNext = "";
  let previousPage = -1;
  let nextPage = -1;

  let queryString = queryStringFromParams(listRequestParams, true);
  queryString = queryString.replace("&page=" + currentPage.toString(), "");

  if (currentPage > pageCount) {
    currentPage = pageCount;
  }

  if (currentPage > 1) {
    previousPage = currentPage - 1;
    queryStringPrevious = `${listsRoutes.results}?${queryString}&page=${previousPage}`;
  }
  if (currentPage < pageCount) {
    nextPage = currentPage + 1;
    queryStringNext = `${listsRoutes.results}?${queryString}&page=${nextPage}`;
  }
  return {
    queryString,
    currentPage,
    previous: {
      page: previousPage,
      queryString: queryStringPrevious,
    },
    next: {
      page: nextPage,
      queryString: queryStringNext,
    },
  };
}

function getPageItems(props: {
  pageCount: number;
  currentPage: number;
  queryString: string;
}): PaginationItem[] {
  const { pageCount, currentPage, queryString } = props;
  const pageItems: PaginationItem[] = [];

  for (let i = 1; i <= pageCount; i++) {
    let href = "";
    if (i >= currentPage - 2 && i <= currentPage + 2) {
      if (i !== currentPage) {
        href = `${listsRoutes.results}?${queryString}&page=${i}`;
      }
      pageItems.push({
        text: i.toString(),
        href,
      });
    }
  }
  return pageItems;
}

function getFromCount(props: { count: number; currentPage: number }): number {
  const { count, currentPage } = props;
  let from;

  if (count === 0) {
    from = 0;
  } else if (count < ROWS_PER_PAGE) {
    from = count - (count - 1);
  } else {
    from = ROWS_PER_PAGE * currentPage - (ROWS_PER_PAGE - 1);
  }
  return from;
}

function getToCount(props: {
  currentPage: number;
  pageCount: number;
  count: number;
}): number {
  const { currentPage, pageCount, count } = props;
  let to;
  if (currentPage === pageCount) {
    to = count;
  } else {
    to = ROWS_PER_PAGE * currentPage;
  }
  return to;
}
