import type { ListItemJsonData } from "server/models/listItem/providers/deserialisers/types";
import { schedulerLogger } from "scheduler/logger";
import type { RequestError, SendEmailResponse } from "notifications-node-client";
import { isSmokeTest, NOTIFY } from "server/config";
import { getNotifyClient } from "shared/getNotifyClient";
import { providerReminderPersonalisation } from "./dayBeforeReminderPersonalisation";
import type { ListItem } from "@prisma/client";
import type { Meta } from "./types";
import { addReminderEvent } from "scheduler/workers/helpers/addReminderEvent";

const template = NOTIFY.templates.unpublishNotice.providerOneDay;

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

  const missingResponseDataError = new Error("NotifyClient returned no message data; skipping reminder event creation");

  try {
    const response = await getNotifyClient().sendEmail(template, emailAddress, {
      personalisation,
      reference: meta.reference,
    });
    const responseData =
      "data" in response
        ? response.data
        : isSmokeTest
          ? ({
              id: "smoke-test",
              template: { id: template },
            } as SendEmailResponse)
          : undefined;

    if (!responseData) {
      logger.error(missingResponseDataError.message);
      throw missingResponseDataError;
    }

    const event = await addReminderEvent(
      listItem.id,
      // @ts-expect-error - error responses are thrown, so ts-ignoring ErrorResponse warning
      responseData,
      [`sent reminder for ${meta.daysUntilUnpublish} days until unpublish`],
      meta.reference
    );

    if (!event) {
      logger.error(
        `failed to create unpublish reminder event for annual review ${meta.reference}. This email will be sent again at the next scheduled run unless an event is created`
      );
    }

    return responseData;
  } catch (e) {
    if (e === missingResponseDataError) {
      throw e;
    }

    const response = e?.response;

    const isNotifyError = response?.data?.errors;
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
    throw e;
  }
}
