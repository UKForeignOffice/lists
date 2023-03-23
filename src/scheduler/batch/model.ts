import { PrismaClient } from "@prisma/client";

import type { List, CurrentAnnualReview, ListUpdateInput, ListJsonData } from "server/models/types";
import type { ListItemWithHistory } from "server/components/dashboard/listsItems/types";

export const prisma = new PrismaClient();

export interface ListWithFirstPublishedDate {
  listId: number;
  oneYearAfterFirstPublishedDate: Date | string;
}

interface FormattedList {
  id: number;
  items: ListItemWithHistory[];
  jsonData: ListJsonData;
  nextAnnualReviewStartDate: Date | null;
}

export async function addAnnualReviewToList({ listId, oneYearAfterFirstPublishedDate }: ListWithFirstPublishedDate) {
  return await prisma.list.update({
    where: {
      id: listId,
    },
    data: {
      nextAnnualReviewStartDate: oneYearAfterFirstPublishedDate,
    },
  });
}
