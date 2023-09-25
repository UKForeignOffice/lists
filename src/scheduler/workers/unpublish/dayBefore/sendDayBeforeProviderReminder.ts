import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { schedulerLogger } from "scheduler/logger";
import type { RequestError, SendEmailResponse } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { providerReminderPersonalisation } from "./dayBeforeReminderPersonalisation";
import type { ListItem } from "@prisma/client";
import { AnnualReviewProviderEmailType } from "@prisma/client";
import type { Meta } from "./types";
import { addReminderEvent } from "scheduler/workers/helpers/addReminderEvent";
import { getNotifyClient } from "shared/getNotifyClient";

const template = NOTIFY.templates.unpublishNotice.providerOneDay;

const notifyClient = getNotifyClient();

export async function sendDayBeforeProviderReminder(listItem: ListItem, meta: Meta) {
  const logger = schedulerLogger.child({
    listItemId: listItem.id,
    method: "sendDayBeforeProviderReminder",
    timeframe: "dayBefore",
    template,
  });

  const jsonData = listItem.jsonData as ListItemJsonData;
  const personalisation = providerReminderPersonalisation(listItem, meta);
  const emailAddress = jsonData.emailAddress;

  logger.debug(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const event = await addReminderEvent({
      id: listItem.id,
      response: response.data as SendEmailResponse,
      notes: [`sent reminder for ${meta.daysUntilUnpublish} days until unpublish`],
      reference: meta.reference,
      emailType: AnnualReviewProviderEmailType.oneDayBeforeUnpublish,
    });

    if (!event) {
      logger.error(
        `failed to create unpublish reminder event for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
      );
    }

    return response.data;
  } catch (e) {
    const { response } = e;

    const isNotifyError = "data" in response && response.data.errors;
    if (isNotifyError) {
      const errors = response.data.errors as RequestError[];
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
