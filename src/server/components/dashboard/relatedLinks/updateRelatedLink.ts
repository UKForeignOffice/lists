import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import type { List, RelatedLink } from "shared/types";

export async function updateRelatedLink(listId: List["id"], update: RelatedLink, index: number | "new" = "new") {
  const list = await prisma.list.findUnique({
    where: {
      id: listId,
    },
    select: {
      jsonData: true,
    },
  });

  if (!list) {
    logger.error(`updateRelatedLink failed, list ${listId} could not be found`);
    return;
  }

  const { jsonData } = list as Pick<List, "jsonData">;
  const { relatedLinks = [] } = jsonData;

  if (index === "new") {
    relatedLinks.push(update);
  }
  if (!Number.isNaN(index)) {
    // @ts-ignore
    relatedLinks[index] = update;
  }

  return await prisma.list.update({
    where: {
      id: listId,
    },
    data: {
      jsonData: {
        ...jsonData,
        relatedLinks,
      },
    },
  });
}
