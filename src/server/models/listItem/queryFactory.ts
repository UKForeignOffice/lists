import { List, User } from "server/models/types";
import {
  ListIndexOptions,
  PaginationOptions,
  Tags,
  TAGS,
  TagsAsKey,
} from "server/models/listItem/types";
import { util } from "prettier";
import { ListItemEvent, Prisma } from "@prisma/client";

export const tagQueryFactory: Record<
  keyof Tags,
  (options: ListIndexOptions) => Partial<Prisma.ListItemWhereInput>
> = {
  [TAGS.annual_review]: (options) => ({}),
  [TAGS.out_with_provider]: (_options) => ({
    history: {
      some: {
        type: ListItemEvent.CHANGES_REQUESTED,
      },
    },
  }),
  [TAGS.pinned]: (options) => ({
    listItemPinnedBy: {
      some: {
        id: options.userId,
      },
    },
  }),
  [TAGS.published]: (_options) => ({ isPublished: true }),
  [TAGS.to_do]: (_options) => ({ isApproved: true }),
};

export function calculatePagination(
  paginationOptions: PaginationOptions = { shouldPaginate: true }
) {
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
