import { ServiceType } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { ListItemWithCountryName } from "./types";

export function weeklyReminderPersonalisation(listItem: ListItemWithCountryName) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;
  return {
    type: serviceDisplayString[listItemType],
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
