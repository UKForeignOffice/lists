import {
  PaginationOptions,
  Tags,
} from "server/models/listItem/types";
import { Prisma } from "@prisma/client";

/**
 * covert TAGS to prisma query options object
 */
export const queryToPrismaQueryMap: Record<keyof Tags, Prisma.ListItemWhereInput> = {
  out_with_provider: {
    status: {
      in: ["OUT_WITH_PROVIDER", "ANNUAL_REVIEW_OVERDUE"]
    }
  },
  to_do: {
    status: {
      in: ["NEW", "EDITED", "UNPUBLISHED", "CHECK_ANNUAL_REVIEW"]
    }
  },
  no_action_needed: {
    AND: [
      { status: "PUBLISHED" },
      { isAnnualReview: false }
    ]
  },
  live: {
    isPublished: true,
  },
  new: {
    history: { // return if item has never been published
      some: {
        NOT: {
          type: "PUBLISHED"
        }
      }
    }
  },
  unpublished: {
    status: "UNPUBLISHED"
  },
  archived: {},
}


export function calculatePagination(
  paginationOptions: PaginationOptions
): {} | { take: number; skip: number } {
  const currentPage = paginationOptions?.pagination?.page ?? 1;
  const skipAmount = currentPage ? currentPage - 1 : currentPage;
  return {
    take: ITEMS_PER_PAGE,
    skip: skipAmount * ITEMS_PER_PAGE,
  };
}

const ITEMS_PER_PAGE = 20;
