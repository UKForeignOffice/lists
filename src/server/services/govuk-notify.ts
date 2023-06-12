import pluralize from "pluralize";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { NOTIFY } from "server/config";
import { getNotifyClient } from "shared/getNotifyClient";
import type { NotifyResult } from "shared/types";
import type { List } from "server/models/types";
import { prisma } from "server/models/db/prisma-client";
import type { SendEmailOptions } from "notifications-node-client";
import { lowerCase, startCase } from "lodash";

export async function sendAuthenticationEmail(email: string, authenticationLink: string): Promise<boolean> {
  const emailAddress = email.trim();
  const isGovEmailAddress = isGovUKEmailAddress(emailAddress);

  if (!isGovEmailAddress) {
    return false;
  }

  try {
    const result = await getNotifyClient().sendEmail(NOTIFY.templates.auth, emailAddress, {
      personalisation: {
        authenticationLink,
      },
      reference: "",
    });

    return (result as NotifyResult).statusText === "Created";
  } catch (error) {
    logger.error(`sendAuthenticationEmail Error: ${error.message}`);
    return false;
  }
}

export async function sendApplicationConfirmationEmail(
  contactName: string,
  emailAddress: string,
  type: string,
  country: string,
  confirmationLink: string
): Promise<boolean> {
  try {
    const result = await getNotifyClient().sendEmail(NOTIFY.templates.emailConfirmation, emailAddress, {
      personalisation: {
        confirmationLink,
        contactName,
        country,
        type,
      },
      reference: "",
    });

    return (result as NotifyResult).statusText === "Created";
  } catch (error) {
    logger.error(`sendApplicationConfirmationEmail Error: ${error.message}`);
    return false;
  }
}

export async function sendDataPublishedEmail(
  contactName: string,
  emailAddress: string,
  typePlural: string,
  country: string,
  searchLink: string
): Promise<boolean> {
  try {
    const type = pluralize.singular(typePlural);
    const result = await getNotifyClient().sendEmail(NOTIFY.templates.published, emailAddress, {
      personalisation: {
        country,
        contactName,
        searchLink,
        type,
        typePlural,
      },
      reference: "",
    });

    return (result as NotifyResult).statusText === "Created";
  } catch (error) {
    logger.error(`sendDataPublishedEmail Error: ${error.message}`);
    return false;
  }
}

export async function sendEditDetailsEmail(
  contactName: string,
  emailAddress: string,
  typePlural: string,
  message: string,
  changeLink: string
): Promise<{ result?: boolean; error?: Error }> {
  try {
    logger.info(`isSmokeTest[${config.isSmokeTest}]`);
    if (config.isSmokeTest) {
      return { result: true };
    }

    const typeSingular = typePlural
      .split(" ")
      .map((word: string) => {
        return pluralize.singular(word);
      })
      .join(" ");

    message = message.replace(/(?:\r\n)/g, "\n^");

    const result = await getNotifyClient().sendEmail(NOTIFY.templates.edit, emailAddress, {
      personalisation: {
        typeSingular,
        typePlural,
        contactName,
        message,
        changeLink,
      },
      reference: "",
    });

    return { result: (result as NotifyResult).statusText === "Created" };
  } catch (error) {
    const message = `Unable to send change request email: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
}

export async function sendAnnualReviewDateChangeEmail(options: {
  emailAddress: string;
  serviceType: string;
  country: string;
  annualReviewDate: string;
}): Promise<void> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}]`);
      return;
    }

    const personalisation = {
      typePlural: options.serviceType,
      country: options.country,
      annualReviewDate: options.annualReviewDate,
    };
    logger.info(
      `personalisation for sendAnnualReviewDateChangeEmail: ${JSON.stringify(personalisation)}, API key ${
        NOTIFY.apiKey
      }, email address ${options.emailAddress}`
    );
    await getNotifyClient().sendEmail(NOTIFY.templates.editAnnualReviewDate, options.emailAddress, {
      personalisation,
      reference: "",
    });
  } catch (error) {
    throw new Error(`sendAnnualReviewDateChangeEmail Error: ${(error as Error).message}`);
  }
}

export async function sendAnnualReviewCompletedEmail(
  emailAddress: string,
  typePlural: string,
  country: string
): Promise<void> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}]`);
      return;
    }

    const personalisation = {
      typeSingular: pluralize.singular(typePlural),
      country,
    };
    logger.info(
      `personalisation for sendAnnualReviewCompletedEmail: ${JSON.stringify(personalisation)}, API key ${
        NOTIFY.apiKey
      }, email address ${emailAddress}`
    );
    await getNotifyClient().sendEmail(NOTIFY.templates.annualReviewNotices.annualReviewCompleted, emailAddress, {
      personalisation,
      reference: "",
    });
  } catch (error) {
    logger.error(`The annual review completion email could not be sent due to error: ${(error as Error).message}`);
  }
}

async function sendEmails<P extends { [key: string]: any }>(
  templateId: string,
  emailAddresses: string[],
  options: SendEmailOptions<P>
) {
  const notifyClient = getNotifyClient();

  logger.info(
    `Template ID: ${templateId}, to emails ${emailAddresses}, with sendEmailOption ${JSON.stringify(options)}`,
    { method: "sendEmails" }
  );

  const requests = emailAddresses.map(async (emailAddress) => {
    return await notifyClient.sendEmail(templateId, emailAddress, options);
  });

  return await Promise.allSettled(requests);
}

type NotificationTrigger = "PROVIDER_SUBMITTED" | "CHANGED_DETAILS" | "UNPUBLISHED";
export async function sendManualActionNotificationToPost(listId: number, trigger: NotificationTrigger) {
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
    },
    include: {
      country: true,
    },
  });

  if (!list) {
    logger.error(`${listId} could not be found, could not send notification for ${trigger}`, {
      method: "sendManualActionNotificationToPost",
    });
    return { error: `invalid ${listId}` };
  }

  const notificationTypeToTemplateId: Record<NotificationTrigger, string> = {
    PROVIDER_SUBMITTED: NOTIFY.templates.newListItemSubmitted,
    CHANGED_DETAILS: NOTIFY.templates.editProviderDetails,
    UNPUBLISHED: NOTIFY.templates.listItemUnpublished,
  };

  const templateId = notificationTypeToTemplateId[trigger];

  if (!templateId) {
    logger.error(`Trigger was ${trigger} but the associated email could not be found`, {
      method: "sendManualActionNotificationToPost",
    });
  }

  const { jsonData = {} } = list as List;
  const { users = [] } = jsonData;

  const personalisation = {
    serviceType: lowerCase(startCase(list.type)),
    country: list.country?.name,
  };

  const results = await sendEmails(templateId, users, { personalisation, reference: "" });

  results
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(`Sending to ${trigger} - ${templateId} failed due to ${failedResult.reason}`);
    });

  if (results.find((result) => result.status === "fulfilled")) {
    logger.info(`sending to ${trigger} - ${templateId} succeeded at least once`);
  }

  return results;
}
