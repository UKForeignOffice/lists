import { schedulerLogger } from "scheduler/logger";
import { NotifyClient, RequestError } from "notifications-node-client";
import { NOTIFY } from "server/config";
import { Meta } from "../types";
import { dayBeforePostReminderPersonalisation } from "./dailyReminderPersonalisation";
import { AuditEvent, List } from "@prisma/client";
import { recordListItemEvent } from "server/models/audit";

const template = NOTIFY.templates.unpublishNotice.postOneDay;

const logger = schedulerLogger.child({ method: "sendUnpublishEmail", template });
const notifyClient = new NotifyClient(NOTIFY.apiKey);

export async function sendDayBeforeUnpublishPostReminder(
  emailAddress: string,
  list: List,
  numberNotResponded: number,
  meta: Meta
) {
  const personalisation = dayBeforePostReminderPersonalisation(list, numberNotResponded, meta);

  logger.silly(`${JSON.stringify(personalisation)}, email address ${emailAddress}`);

  try {
    const response = await notifyClient.sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });

    const updateAudit = await recordListItemEvent(
      {
        reminderType: "sendUnpublishOneDayPostEmail",
        eventName: "reminder",
        itemId: list.id,
        annualReviewRef: meta.reference,
      },
      AuditEvent.PUBLISHED,
      "list"
    );

    if (!updateAudit) {
      logger.error(
        `${meta.daysUntilUnpublish} days until unpublish reminder event failed to create for list ${list.id}. for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
      );
      logger.warn(
        `Query for event insertion: insert into "Audit"("listId", type, "jsonData") values (${list.id}, 'REMINDER', '{"eventName": "reminder", "notes": ["${meta.daysUntilUnpublish} day until unpublish"], "reference": "${meta.reference}"}');`
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
