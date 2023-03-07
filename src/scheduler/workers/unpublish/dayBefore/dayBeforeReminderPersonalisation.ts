import { ServiceType } from "server/models/types";
import { Meta } from "../../types";
import { List, ListItem } from "@prisma/client";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { createAnnualReviewProviderUrl } from "scheduler/helpers";

export function providerReminderPersonalisation(listItem: ListItem, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;

  return {
    typePlural: serviceDisplayString[listItemType],
    contactName: jsonData.contactName,
    country: meta.countryName,
    changeLink: createAnnualReviewProviderUrl(listItem),
  };
}

export function postReminderPersonalisation(list: List, numberNotResponded: number, meta: Meta) {
  const listItemType = list.type as ServiceType;

  return {
    typePlural: serviceDisplayString[listItemType],
    typePluralCapitalised: serviceDisplayString[listItemType].toUpperCase(),
    country: meta.countryName,
    numberNotResponded,
  };
}

const serviceDisplayString: Record<ServiceType, string> = {
  covidTestProviders: "Covid test providers",
  funeralDirectors: "Funeral directors",
  lawyers: "Lawyers",
  translatorsInterpreters: "Translator or interpreters",
};
