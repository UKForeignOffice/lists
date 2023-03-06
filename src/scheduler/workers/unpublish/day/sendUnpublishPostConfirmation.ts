import { schedulerLogger } from "scheduler/logger";
import { NotifyClient, RequestError } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { Meta } from "../types";
import { postReminderPersonalisation } from "./dayReminderPersonalisation";
import { AuditEvent, List } from "@prisma/client";
import {
  addUnpublishPostReminderAudit
} from "scheduler/workers/unpublish/day/changeState/addUnpublishPostReminderAudit";

const template = NOTIFY.templates.unpublishNotice.postUnpublished;

const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendUnpublishPostConfirmation(
  emailAddress: string,
  list: List,
  numberNotResponded: number,
  meta: Meta
) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendUnpublishPostConfirmation", template });
  const personalisation = postReminderPersonalisation(list, numberNotResponded, meta);

  logger.silly(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const updateAudit = await addUnpublishPostReminderAudit(
      {
        reminderType: "sendUnpublishedPostEmail",
        eventName: "reminder",
        itemId: list.id,
        annualReviewRef: meta.reference,
      },
      AuditEvent.UNPUBLISHED,
    );

    if (!updateAudit) {
      logger.error(
        `unpublish reminder event failed to add for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created.`
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
