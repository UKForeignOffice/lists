import type { ServiceType } from "shared/types";
import type { Meta } from "./types";
import type { List, ListItem } from "@prisma/client";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";

export function providerReminderPersonalisation(listItem: ListItem, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;

  return {
    typePlural: serviceDisplayString[listItemType],
    contactName: jsonData.contactName,
    country: meta.countryName,
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
  funeralDirectors: "Funeral directors",
  lawyers: "Lawyers",
  translatorsInterpreters: "Translator or interpreters",
};
