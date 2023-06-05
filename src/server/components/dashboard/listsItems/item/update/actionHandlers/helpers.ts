import { createListSearchBaseLink } from "server/components/lists";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendDataPublishedEmail, sendManualUnpublishedEmail } from "server/services/govuk-notify";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import type { List } from "server/models/types";
import { lowerCase, startCase } from "lodash";
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

export async function sendUnpublishEmail(list: List) {
  if (list?.jsonData?.users) {
    const tasks = list.jsonData.users.map(async (user) => {
      await sendManualUnpublishedEmail({
        emailAddress: user,
        serviceType: lowerCase(startCase(list.type)),
        country: list.country?.name as string,
      });
    });
    await Promise.allSettled(tasks);
  }
}
