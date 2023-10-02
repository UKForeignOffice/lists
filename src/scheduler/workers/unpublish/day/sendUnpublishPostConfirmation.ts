import { schedulerLogger } from "scheduler/logger";
import { NotifyClient } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { postReminderPersonalisation } from "./dayReminderPersonalisation";

import type { List } from "server/models/types";
import type { Meta } from "./types";
import type { RequestError } from "notifications-node-client";

const template = NOTIFY.templates.unpublishNotice.postUnpublished;

const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendUnpublishPostConfirmation(list: List, numberNotResponded: number, meta: Meta) {
  const logger = schedulerLogger.child({
    listId: list.id,
    method: "sendUnpublishPostConfirmation",
    timeframe: "day",
    template,
  });
  const personalisation = postReminderPersonalisation(list, numberNotResponded, meta);

  try {
    const emailRequests = list.users.map(async (user) => {
      return await notifyClient.sendEmail(template, user.email, {
        personalisation,
        reference: meta.reference,
      });
    });
    const response = await Promise.any(emailRequests);
    console.log(`sendUnpublishPostConfirmation - ${JSON.stringify(response.data)}`);
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
  }
}
