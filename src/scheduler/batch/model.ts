import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface ListWithFirstPublishedDate {
  listId: number;
  oneYearAfterFirstPublishedDate: Date | string;
}

export async function addAnnualReviewToList({ listId, oneYearAfterFirstPublishedDate }: ListWithFirstPublishedDate) {
  return prisma.list.update({
    where: {
      id: listId,
    },
    data: {
      nextAnnualReviewStartDate: oneYearAfterFirstPublishedDate,
    },
  });
}
