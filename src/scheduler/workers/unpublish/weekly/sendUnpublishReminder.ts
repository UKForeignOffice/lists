import pluralize from "pluralize";
import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { ServiceType } from "server/models/types";
import { logger as parentLogger } from "server/services/logger";
import { NotifyClient, RequestError } from "notifications-node-client";
import { NODE_ENV, NOTIFY } from "server/config";
import { ListItemWithAddressCountry } from "server/models/listItem/providers/types";
import { Meta } from "scheduler/workers/unpublish/weekly/types";
import { addUnpublishReminderEvent } from "scheduler/workers/unpublish/weekly/addUnpublishReminderEvent";

const template = "XX";
const logger = parentLogger.child({ method: "sendUnpublishEmail", template });
const notifyClient = new NotifyClient(NOTIFY.apiKey);

const proxy = new Proxy(notifyClient, {
  get(target, prop, receiver) {
    const value = target[prop];
    if (NODE_ENV === "production") return value;

    if (value instanceof Function) {
      return async function () {
        if (Math.random() >= 0.5) {
          return {
            data: {
              status_code: 200,
            },
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw {
          data: {
            status_code: 400,
            errors: [],
          },
        };
      };
    }
  },
});

export async function sendUnpublishReminder(listItem: ListItemWithAddressCountry, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const listItemType = listItem.type as ServiceType;
  const personalisation = {
    type: serviceDisplayString[listItemType],
    weeksUntilUnpublish: pluralize("week", meta.weeksUntilUnpublish, true),
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

    /**
     * TODO: In future we can use the response object and query the API to retry rather than rely on a "missing" event.
     * https://docs.notifications.service.gov.uk/node.html#send-an-email-response
     */

    const event = addUnpublishReminderEvent(listItem.id, [personalisation.weeksUntilUnpublish], meta.reference);

    if (!event) {
      logger.error(
        `${meta.weeksUntilUnpublish} weeks until unpublish reminder event failed to create for ${listItem.id}. for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
      );
      logger.warn(
        `insert into "Event"("listItemId", type, "jsonData") values (${listItem.id}, 'REMINDER', '{"eventName": "reminder", "notes": ["${personalisation.weeksUntilUnpublish} until unpublish"], "reference": "${meta.reference}"}');`
      );
    }

    return response.data;
  } catch (e) {
    if ("data" in e && e.data.errors) {
      const errors = e.data.errors as RequestError[];
      // eslint-disable-next-line @typescript-eslint/naming-convention
      errors.forEach(({ status_code, error, message }) => {
        logger.error(`NotifyClient responded with ${status_code}, ${error}, ${message}`);
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
