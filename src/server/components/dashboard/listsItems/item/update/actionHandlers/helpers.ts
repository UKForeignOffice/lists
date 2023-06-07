import { createListSearchBaseLink } from "server/components/lists";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendDataPublishedEmail, sendManualUnpublishedEmail } from "server/services/govuk-notify";
import type { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import type { List } from "server/models/types";
import { lowerCase, startCase } from "lodash";
import { prisma } from "scheduler/prismaClient";
import { logger } from "server/services/logger";

export async function sendPublishedEmail(listItem: ListItemWithAddressCountry) {
  const searchLink = createListSearchBaseLink(listItem.type);
  const { contactName, contactEmailAddress } = getListItemContactInformation(listItem);
  const typeName = serviceName(listItem.type);

  return await sendDataPublishedEmail(
    contactName,
    contactEmailAddress,
    typeName,
    listItem.address.country.name,
    searchLink
  );
}

export async function sendUnpublishEmail(listId: number) {
  const list = (await prisma.list.findFirst({
    where: { id: listId },
  })) as List;

  const users = list.jsonData.users as string[];

  if (!users) {
    logger.error(`No users found for list ${listId}`);
    return;
  }

  logger.info(`Sending unpublish email to ${users.length} users`);

  if (users) {
    const tasks = users.map(async (user) => {
      await sendManualUnpublishedEmail({
        emailAddress: user,
        serviceType: lowerCase(startCase(list.type)),
        country: list.country?.name as string,
      });
    });
    await Promise.allSettled(tasks);
  }
}
