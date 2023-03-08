import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { schedulerLogger } from "scheduler/logger";
import { NotifyClient, RequestError } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { addUnpublishReminderEvent } from "./addUnpublishReminderEvent";
import { weeklyReminderPersonalisation } from "./weeklyReminderPersonalisation";
import { ListItem } from "@prisma/client";
import { Meta } from "scheduler/workers/types";

const template = NOTIFY.templates.annualReviewNotices.providerStart;

const logger = schedulerLogger.child({ method: "sendUnpublishEmail", template });
const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendUnpublishReminder(listItem: ListItem, meta: Meta) {
  const jsonData = listItem.jsonData as ListItemJsonData;
  const personalisation = weeklyReminderPersonalisation(listItem, meta);
  const emailAddress = jsonData.emailAddress;

  logger.silly(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const event = await addUnpublishReminderEvent(
      listItem.id,
      // @ts-ignore - error responses are thrown, so ts-ignoring ErrorResponse warning
      response.data,
      [`sent reminder for week ${meta.weeksSinceStart}. (${meta.weeksUntilUnpublish} until unpublish date)`],
      meta.reference
    );

    if (!event) {
      logger.error(
        `${meta.weeksUntilUnpublish} weeks until unpublish reminder event failed to create for ${listItem.id}. for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
      );
      logger.warn(
        `Query for event insertion: insert into "Event"("listItemId", type, "jsonData") values (${listItem.id}, 'REMINDER', '{"eventName": "reminder", "notes": ["sent reminder for week ${meta.weeksSinceStart}. (${meta.weeksUntilUnpublish} until unpublish date)"], "reference": "${meta.reference}"}');`
      );
    }

    return response.data;
  } catch (e) {
    const { response } = e;

    const isNotifyError = "data" in response && response.data.errors;
    if (isNotifyError) {
      const errors = response.data.errors as RequestError[];
      // eslint-disable-next-line @typescript-eslint/naming-convention
      errors.forEach(({ error, message }) => {
        logger.error(
          `NotifyClient responded with code: ${response.data.status_code}, error: ${error}, message: ${message}`
        );
      });
      throw e;
    }

    logger.error(
      `Failed to make request to NotifyClient with personalisations ${JSON.stringify(
        personalisation
      )} for email address ${emailAddress} - ${e}`
    );
  }
}
