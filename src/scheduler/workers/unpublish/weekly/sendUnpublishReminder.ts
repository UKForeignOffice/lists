import { ListItem } from "@prisma/client";
import pluralize from "pluralize";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { ServiceType } from "server/models/types";
import { logger as parentLogger } from "server/services/logger";
import { NotifyClient } from "notifications-node-client";
import { NOTIFY } from "server/config";

const template = "XX";
const logger = parentLogger.child({ method: "sendUnpublishEmail", template });
const notifyClient = new NotifyClient(NOTIFY.apiKey);

interface Meta {
  reference: string;
  weeksUntilUnpublish: number;
}

const proxy = new Proxy(notifyClient, {
  get(target, prop, receiver) {
    const value = target[prop];
    if (value instanceof Function) {
      return function (...args) {
        console.log("mocked");
        return value.apply(this === receiver ? target : this, args);
      };
    }
    return value;
  },
});

export async function sendUnpublishReminder(listItem: ListItem, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;
  const personalisation = {
    type: serviceDisplayString[listItemType],
    weeksUntilUnpublish: pluralize("week", meta.weeksUntilUnpublish),
    contactName: jsonData.contactName,
    country: listItem.address.country.name,
  };
  const emailAddress = jsonData.emailAddress;
  logger.info(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await proxy.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    return response.data;
  } catch (e) {
    if (e.data?.errors) {
      errors.forEach((error) => {
        logger.error(`NotifyClient responded with ${error.status_code}, ${error}, ${error.message}`);
      });
      return e;
    }

    logger.error(`Failed to make request to NotifyClient ${e}`);
  }
}

const serviceDisplayString: Record<ServiceType, string> = {
  covidTestProviders: "Covid test providers",
  funeralDirectors: "Funeral directors",
  lawyers: "Lawyers",
  translatorsInterpreters: "Translator or interpreters",
};
