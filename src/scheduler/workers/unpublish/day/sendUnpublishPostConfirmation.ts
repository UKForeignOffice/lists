import { schedulerLogger } from "scheduler/logger";
import { NotifyClient } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { postReminderPersonalisation } from "./dayReminderPersonalisation";

import type { List } from "server/models/types";
import type { Meta } from "./types";
import type { RequestError } from "notifications-node-client";

const template = NOTIFY.templates.unpublishNotice.postUnpublished;

const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendUnpublishPostConfirmation(
  emailAddress: string,
  list: List,
  numberNotResponded: number,
  meta: Meta
) {
  const logger = schedulerLogger.child({
    listId: list.id,
    method: "sendUnpublishPostConfirmation",
    timeframe: "day",
    template,
  });
  const personalisation = postReminderPersonalisation(list, numberNotResponded, meta);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

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
