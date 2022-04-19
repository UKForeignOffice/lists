import {
  ListIndexOptions,
  PaginationOptions,
  Tags,
  TAGS,
} from "server/models/listItem/types";
import { ListItemEvent, Status, Prisma } from "@prisma/client";

export const tagQueryFactory: Record<
  keyof Tags,
  (options: ListIndexOptions) => Partial<Prisma.ListItemWhereInput>
> = {
  // TODO:- enable when ready
  // [TAGS.annual_review]: () => ({ isPublished: false }),
  [TAGS.out_with_provider]: () => ({
    history: {
      some: {
        type: ListItemEvent.CHANGES_REQUESTED,
      },
    },
  }),
  [TAGS.pinned]: (options: ListIndexOptions) => {
    return {
      pinnedBy: {
        some: {
          id: options.userId,
        },
      },
    };
  },
  [TAGS.published]: () => ({ isPublished: true }),
  [TAGS.to_do]: () => ({ status: Status.NEW }),
};

export function calculatePagination(
  paginationOptions: PaginationOptions = { shouldPaginate: true }
): {} | { take: number; skip: number } {
  const { shouldPaginate } = paginationOptions;
  if (!shouldPaginate) return {};

  const currentPage = paginationOptions?.pagination?.page ?? 1;
  const skipAmount = currentPage ? currentPage - 1 : currentPage;
  return {
    take: ITEMS_PER_PAGE,
    skip: skipAmount * ITEMS_PER_PAGE,
  };
}

const ITEMS_PER_PAGE = 20;
