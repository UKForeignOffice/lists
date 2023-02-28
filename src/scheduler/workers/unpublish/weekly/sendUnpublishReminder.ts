import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { logger as parentLogger } from "server/services/logger";
import { NotifyClient, RequestError } from "notifications-node-client";
import { NODE_ENV, NOTIFY } from "server/config";
import { ListItemWithCountryName, Meta } from "./types";
import { addUnpublishReminderEvent } from "./addUnpublishReminderEvent";
import { weeklyReminderPersonalisation } from "./weeklyReminderPersonalisation";

const template = NOTIFY.templates.annualReviewNotices.providerStart ?? "1f94c831-0181-4b59-b70a-b3304db7f4c2";

const logger = parentLogger.child({ method: "sendUnpublishEmail", template });
const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendUnpublishReminder(listItem: ListItemWithCountryName, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const personalisation = weeklyReminderPersonalisation(listItem, meta);
  // const emailAddress = jsonData.emailAddress;

  const emailAddress = "simulate-delivered@notifications.service.gov.uk";
  logger.debug(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const event = await addUnpublishReminderEvent(
      listItem.id,
      [
        `sent reminder for ${meta.weeksUntilUnpublish} weeks until unpublish`,
        JSON.stringify({
          notify_response: response.data,
        }),
      ],
      meta.reference
    );

    if (!event) {
      logger.error(
        `${meta.weeksUntilUnpublish} weeks until unpublish reminder event failed to create for ${listItem.id}. for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
      );
      logger.warn(
        `Query for event insertion: insert into "Event"("listItemId", type, "jsonData") values (${listItem.id}, 'REMINDER', '{"eventName": "reminder", "notes": ["${meta.weeksUntilUnpublish} until unpublish"], "reference": "${meta.reference}"}');`
      );
    }

    return response.data;
  } catch (e) {
    const isNotifyError = "data" in e && e.data.errors;
    if (isNotifyError) {
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
