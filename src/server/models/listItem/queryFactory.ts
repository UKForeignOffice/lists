import {
  ListIndexOptions,
  PaginationOptions,
  Tags,
  TAGS,
} from "server/models/listItem/types";
import { Status, Prisma } from "@prisma/client";

export const tagQueryFactory: Record<
  keyof Tags,
  (options: ListIndexOptions) => Partial<Prisma.ListItemWhereInput> | Prisma.Enumerable<Prisma.ListItemWhereInput>
> = {
  // TODO:- enable when ready
  // [TAGS.annual_review]: () => ({ isPublished: false }),
  [TAGS.out_with_provider]: () => ([{ status: Status.OUT_WITH_PROVIDER }]),
  [TAGS.pinned]: (options: ListIndexOptions) => {
    return {
      pinnedBy: {
        some: {
          id: options.userId,
        },
      },
    };
  },
  [TAGS.published]: () => ([{ isPublished: true }]),
  [TAGS.to_do]: () => ([{ status: Status.NEW },{ status: Status.EDITED },{ status: Status.UNPUBLISHED }]),
};

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
