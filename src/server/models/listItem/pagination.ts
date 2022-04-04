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
  rows?: number;
  route?: string;
  listRequestParams?: ListsRequestParams;
}): Promise<PaginationResults> {
  const {
    count,
    page,
    listRequestParams,
    rows = ROWS_PER_PAGE,
    route = listsRoutes.results,
  } = props;
  let pageCount = 0;
  if (count > 0 && rows > 0) {
    pageCount = Math.ceil(count / rows);
  }

  const nextPrevious = getNextPrevious({
    page,
    pageCount,
    route,
    listRequestParams,
  });
  const { queryString, currentPage } = nextPrevious;

  const pageItems: PaginationItem[] = getPageItems({
    pageCount,
    route,
    currentPage,
    queryString,
  });

  const from = getFromCount({ count, currentPage, rows });
  const to = getToCount({
    currentPage,
    pageCount,
    count,
    rows,
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
  route: string;
  listRequestParams?: ListsRequestParams;
}

export function getNextPrevious({
  page = 1,
  pageCount,
  route,
  listRequestParams = {},
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
    queryStringPrevious = `${route}?${queryString}&page=${previousPage}`;
  }
  if (currentPage < pageCount) {
    nextPage = currentPage + 1;
    queryStringNext = `${route}?${queryString}&page=${nextPage}`;
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
  route: string;
  queryString: string;
}): PaginationItem[] {
  const { pageCount, currentPage, queryString, route } = props;
  const pageItems: PaginationItem[] = [];

  for (let i = 1; i <= pageCount; i++) {
    let href = "";
    if (i >= currentPage - 2 && i <= currentPage + 2) {
      if (i !== currentPage) {
        href = `${route}?${queryString}&page=${i}`;
      }
      pageItems.push({
        text: i.toString(),
        href,
      });
    }
  }
  return pageItems;
}

function getFromCount(props: {
  count: number;
  currentPage: number;
  rows: number;
}): number {
  const { count, currentPage, rows = ROWS_PER_PAGE } = props;
  let from;

  if (count === 0) {
    from = 0;
  } else if (count < rows) {
    from = count - (count - 1);
  } else {
    from = rows * currentPage - (rows - 1);
  }
  return from;
}

function getToCount(props: {
  currentPage: number;
  pageCount: number;
  count: number;
  rows: number;
}): number {
  const { currentPage, pageCount, count, rows = ROWS_PER_PAGE } = props;
  let to;
  if (currentPage === pageCount) {
    to = count;
  } else {
    to = rows * currentPage;
  }
  return to;
}
