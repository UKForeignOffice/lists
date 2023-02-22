import { prisma } from "server/models/db/prisma-client";
import { ScheduledProcessKeyDates } from "server/models/types";

function findNonRespondents() {
  prisma.list.findMany({
    where: {
      nextAnnualReviewStartDate: {
        lte: Date(),
      },
    },
    select: {
      items: {
        where: {
          isAnnualReview: true,
          status: "OUT_WITH_PROVIDER",
          history: {
            none: {
              AND: [
                { type: "EDITED" },
                {
                  time: {},
                },
              ],
            },
          },
        },
      },
    },
  });
}

interface F {
  [id: number]: {
    id: number;
    nextAnnualReviewStartDate: Date;
    annualReview: ScheduledProcessKeyDates["annualReview"];
    unpublished: ScheduledProcessKeyDates["unpublished"];
  };
}
async function interactive() {
  return await prisma.$transaction(async (tx) => {
    const listsWithItemsInAnnualReview = await tx.list.findMany({
      where: {
        nextAnnualReviewStartDate: {
          lte: Date(),
        },
        items: {
          some: {
            isAnnualReview: true,
          },
        },
      },
    });

    const m = listsWithItemsInAnnualReview.map((list) => ({
      id: list.id,
      nextAnnualReviewStartDate: list.nextAnnualReviewStartDate,
      // @ts-ignore
      annualReview: list.jsonData!.currentAnnualReview!.keyDates
        .annualReview as ScheduledProcessKeyDates["annualReview"],
      // @ts-ignore
      unpublished: list.jsonData!.currentAnnualReview!.keyDates.annualReview as ScheduledProcessKeyDates["unpublished"],
      where: {
        listId: list.id,
        isAnnualReview: true,
        status: "OUT_FOR_ANNUAL_REVIEW",
        history: {
          none: {
            // no "edited" event found.
            AND: [
              { type: "EDITED" },
              {
                time: {
                  gte: list.nextAnnualReviewStartDate,
                },
              },
            ],
          },
        },
      },
    }));

    return m;
  });
}
