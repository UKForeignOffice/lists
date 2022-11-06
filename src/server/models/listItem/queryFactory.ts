import {
  PaginationOptions,
  Tags,
  TAGS,
} from "server/models/listItem/types";
import { Status, Prisma } from "@prisma/client";

/**
 * covert TAGS to prisma query options object
 */
export const tagQueryFactory: Record<
  keyof Tags, Array<Prisma.ListItemWhereInput | Prisma.Enumerable<Prisma.ListItemWhereInput>>> = {
  archived: [],
  new: [],
  no_action_needed: [],
  unpublished: [],
  [TAGS.out_with_provider]: [{ status: Status.OUT_WITH_PROVIDER }],
  [TAGS.live]: [{ isPublished: true }],
  [TAGS.to_do]: [{ status: Status.NEW },{ status: Status.EDITED },{ status: Status.UNPUBLISHED }]
};

export const tagToPrismaQueryMap = {
  archived: [],
  new: [],
  no_action_needed: [],
  unpublished: [],
  [TAGS.out_with_provider]: [{ status: Status.OUT_WITH_PROVIDER }],
  [TAGS.live]: [{ isPublished: true }],
  [TAGS.to_do]: [{ status: Status.NEW },{ status: Status.EDITED },{ status: Status.UNPUBLISHED }]
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
