import { PrismaClient } from "@prisma/client";
import { createPrismaAdapter } from "shared/prismaAdapter";

export const prisma = new PrismaClient({ adapter: createPrismaAdapter() });

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
