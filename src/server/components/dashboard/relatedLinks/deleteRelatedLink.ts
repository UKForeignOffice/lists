import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import type { List } from "shared/types";

export async function deleteRelatedLink(listId: List["id"], index: number | "new" = "new") {
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

  if (!Number.isNaN(index)) {
    // @ts-ignore
    relatedLinks.splice(index, 1);
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
