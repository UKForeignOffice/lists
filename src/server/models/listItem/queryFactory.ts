import type { PaginationOptions, Tags } from "server/models/listItem/types";
import type { Prisma } from "@prisma/client";

/**
 * covert TAGS to prisma query options object
 */
export const queryToPrismaQueryMap: Record<keyof Tags, Prisma.ListItemWhereInput> = {
  out_with_provider: {
    status: {
      in: ["OUT_WITH_PROVIDER", "ANNUAL_REVIEW_OVERDUE"],
    },
  },
  to_do: {
    status: {
      in: ["NEW", "EDITED", "UNPUBLISHED", "CHECK_ANNUAL_REVIEW"],
    },
    history: {
      none: {
        type: "ARCHIVED",
      },
    },
  },
  no_action_needed: {
    AND: [{ status: "PUBLISHED" }, { isAnnualReview: false }],
  },
  live: {
    isPublished: true,
  },
  new: {
    history: {
      every: {
        type: {
          notIn: ["PUBLISHED", "ARCHIVED"],
        },
      },
    },
  },
  archived: {
    history: {
      some: {
        type: "ARCHIVED",
      },
    },
  },
  unpublished: {
    AND: [
      {
        history: {
          some: {
            type: "PUBLISHED",
          },
        },
      },
      {
        isPublished: false,
      },
      {
        NOT: {
          history: {
            some: {
              type: "ARCHIVED",
            },
          },
        },
      },
    ],
  },
};

export function calculatePagination(
  paginationOptions: PaginationOptions
): Record<string, unknown> | { take: number; skip: number } {
  const currentPage = paginationOptions?.pagination?.page ?? 1;
  const skipAmount = currentPage ? currentPage - 1 : currentPage;
  return {
    take: ITEMS_PER_PAGE,
    skip: skipAmount * ITEMS_PER_PAGE,
  };
}

const ITEMS_PER_PAGE = 20;
