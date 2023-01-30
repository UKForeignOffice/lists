import { createListSearchBaseLink } from "server/components/lists";
import { getListItemContactInformation } from "server/models/listItem/providers/helpers";
import serviceName from "server/utils/service-name";
import { sendDataPublishedEmail } from "server/services/govuk-notify";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";

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
