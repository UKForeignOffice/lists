import { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { schedulerLogger } from "scheduler/logger";
import { NotifyClient, RequestError } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { Meta } from "./types";
import { providerReminderPersonalisation } from "./dayReminderPersonalisation";
import { ListItem } from "@prisma/client";
import { addReminderEvent } from "scheduler/workers/helpers/addReminderEvent";

const template = NOTIFY.templates.unpublishNotice.providerUnpublished;

const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendUnpublishProviderConfirmation(listItem: ListItem, meta: Meta) {
  const logger = schedulerLogger.child({
    listId: listItem.listId,
    listItemId: listItem.id,
    method: "sendUnpublishProviderConfirmation",
    timeframe: "day",
    template,
  });

  const jsonData = listItem.jsonData as ListItemJsonData;
  const personalisation = providerReminderPersonalisation(listItem, meta);
  const emailAddress = jsonData.emailAddress;

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const event = await addReminderEvent(
      listItem.id,
      // @ts-ignore - error responses are thrown, so ts-ignoring ErrorResponse warning
      response.data,
      [`sent reminder for ${meta.daysUntilUnpublish} days until unpublish`],
      meta.reference
    );

    if (!event) {
      logger.error(
        `unpublish reminder event failed to create. for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
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
