import { prisma } from "server/models/db/prisma-client";
import { logger } from "server/services/logger";
import { List } from "shared/types";

export async function addRelatedLink(listId, update) {
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

  relatedLinks.push(update);

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
