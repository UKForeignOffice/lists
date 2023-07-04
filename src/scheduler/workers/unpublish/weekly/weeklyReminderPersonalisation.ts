import type { ServiceType } from "shared/types";
import type { ListItem } from "@prisma/client";
import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { createAnnualReviewProviderUrl } from "scheduler/workers/createAnnualReviewProviderUrl";
import type { Meta } from "scheduler/workers/types";

export function weeklyReminderPersonalisation(listItem: ListItem, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;
  return {
    typePlural: serviceDisplayString[listItemType],
    contactName: jsonData.contactName,
    country: meta.countryName,
    deletionDate: meta.parsedUnpublishDate,
    changeLink: createAnnualReviewProviderUrl(listItem),
  };
}

const serviceDisplayString: Record<ServiceType, string> = {
  funeralDirectors: "Funeral directors",
  lawyers: "Lawyers",
  translatorsInterpreters: "Translator or interpreters",
};
