import { ServiceType } from "server/models/types";
import pluralize from "pluralize";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { ListItemWithCountryName, Meta } from "./types";

export function weeklyReminderPersonalisation(listItem: ListItemWithCountryName, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;
  return {
    type: serviceDisplayString[listItemType],
    weeksUntilUnpublish: pluralize("week", meta.weeksUntilUnpublish, true),
    contactName: jsonData.contactName,
    country: listItem.address.country.name,
  };
}

const serviceDisplayString: Record<ServiceType, string> = {
  covidTestProviders: "Covid test providers",
  funeralDirectors: "Funeral directors",
  lawyers: "Lawyers",
  translatorsInterpreters: "Translator or interpreters",
};
