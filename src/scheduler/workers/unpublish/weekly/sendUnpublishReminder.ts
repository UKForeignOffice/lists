import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { schedulerLogger } from "scheduler/logger";
import type { RequestError, SendEmailResponse } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { weeklyReminderPersonalisation } from "./weeklyReminderPersonalisation";
import type { ListItem } from "@prisma/client";
import { AnnualReviewProviderEmailType } from "@prisma/client";
import type { Meta } from "./types";
import { addReminderEvent } from "scheduler/workers/helpers/addReminderEvent";
import { getNotifyClient } from "shared/getNotifyClient";

const template = NOTIFY.templates.annualReviewNotices.providerStart;
const notifyClient = getNotifyClient();
export async function sendUnpublishReminder(listItem: ListItem, meta: Meta) {
  const logger = schedulerLogger.child({
    listId: listItem.listId,
    listItemId: listItem.id,
    method: "sendUnpublishReminder",
    template,
    timeframe: "weekly",
  });
  const jsonData = listItem.jsonData as ListItemJsonData;
  const personalisation = weeklyReminderPersonalisation(listItem, meta);
  const emailAddress = jsonData.emailAddress;

  logger.silly(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const event = await addReminderEvent({
      id: listItem.id,
      response: response.data as SendEmailResponse,
      notes: [`sent reminder for week ${meta.weeksSinceStart}. (${meta.weeksUntilUnpublish} until unpublish date)`],
      reference: meta.reference,
      emailType: AnnualReviewProviderEmailType.weeklyUnpublish,
    });

    if (!event) {
      logger.error(
        `'${meta.weeksUntilUnpublish} weeks until unpublish' reminder event failed to create for ${listItem.id} for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
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
