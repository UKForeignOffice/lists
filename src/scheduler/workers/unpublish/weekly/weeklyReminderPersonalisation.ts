import { ServiceType } from "server/models/types";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { ListItemWithCountryName, Meta } from "./types";
import { createAnnualReviewProviderUrl } from "scheduler/helpers";

export function weeklyReminderPersonalisation(listItem: ListItemWithCountryName, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;
  return {
    typePlural: serviceDisplayString[listItemType],
    contactName: jsonData.contactName,
    country: listItem.address.country.name,
    deletionDate: meta.parsedUnpublishDate,
    changeLink: createAnnualReviewProviderUrl(listItem),
  };
}

const serviceDisplayString: Record<ServiceType, string> = {
  covidTestProviders: "Covid test providers",
  funeralDirectors: "Funeral directors",
  lawyers: "Lawyers",
  translatorsInterpreters: "Translator or interpreters",
};
