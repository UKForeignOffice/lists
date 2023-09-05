import { prisma } from "../model";
import type { Event } from "shared/types";
export async function findListItemsWithRequestedEdit() {
  const listItems = await prisma.listItem.findMany({
    where: {
      isAnnualReview: false,
      status: "OUT_WITH_PROVIDER",
    },
    include: {
      address: {
        include: {
          country: true,
        },
      },
      history: {
        where: {
          type: "OUT_WITH_PROVIDER",
        },
        take: 1,
        orderBy: {
          time: "desc",
        },
      },
    },
  });

  if (!listItems) {
    return [];
  }

  return listItems.map((listItem) => {
    const { history, ...rest } = listItem;
    const event = history[0] as Event;
    const message = event.jsonData.requestedChanges as string;
    return {
      listItem: rest,
      message,
    };
  });
}
