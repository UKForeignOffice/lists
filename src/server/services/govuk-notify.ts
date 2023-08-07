import pluralize from "pluralize";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { FEEDBACK_EMAIL_ADDRESSES, NOTIFY } from "server/config";
import { getNotifyClient } from "shared/getNotifyClient";
import type { NotifyResult } from "shared/types";
import type { List } from "server/models/types";
import { prisma } from "server/models/db/prisma-client";
import type { SendEmailOptions } from "notifications-node-client";
import { getCommonPersonalisations } from "server/services/govuk-notify.helpers";
import { startCase } from "lodash";

function convertPluralToSingular(typePlural: string): string {
  return typePlural
    .split(" ")
    .map((word: string) => {
      return pluralize.singular(word);
    })
    .join(" ");
}

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

    message = message.replace(/(?:\r\n)/g, "\n^");

    const result = await getNotifyClient().sendEmail(NOTIFY.templates.edit, emailAddress, {
      personalisation: {
        typeSingular: convertPluralToSingular(typePlural),
        typePlural,
        contactName,
        message,
        changeLink,
      },
      reference: "",
    });

    return { result: (result as NotifyResult).statusText === "Created" };
  } catch (error) {
    const message = `sendEditDetailsEmail: Unable to send change request email: ${error.message}`;
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
    logger.error(
      `sendAnnualReviewCompletedEmail: The annual review completion email could not be sent due to error: ${
        (error as Error).message
      }`
    );
  }
}

export async function sendEmails<Personalisation extends { [key: string]: any }>(
  templateId: string,
  emailAddresses: string[],
  options: SendEmailOptions<Personalisation>,
  logLabel: string = ""
) {
  const notifyClient = getNotifyClient();

  logger.info(
    `${logLabel} Template ID: ${templateId}, to emails ${emailAddresses}, with sendEmailOption ${JSON.stringify(
      options
    )}`,
    { method: "sendEmails" }
  );

  const requests = emailAddresses.map(async (emailAddress) => {
    return await notifyClient.sendEmail(templateId, emailAddress, options);
  });

  const settled = await Promise.allSettled(requests);

  settled.filter(hasNotifyError).forEach((reject) => {
    // @ts-ignore
    logger.error(`sendEmails: ${logLabel} Template ID: ${templateId} rejected with from notify API ${reject.reason}`, {
      method: "sendEmails",
    });
  });

  return await Promise.any(requests);
}

function hasNotifyError<T>(settledResult: PromiseSettledResult<T>) {
  return settledResult.status === "rejected";
}

type NotificationTrigger = "PROVIDER_SUBMITTED" | "CHANGED_DETAILS" | "UNPUBLISHED";

/**
 * Use `sendManualActionNotificationToPost` to send multiple emails to all the users of a list.
 * `serviceType` (plural), `type`, and `country` are available in the personalisation.
 * Add a `NotificationTrigger` if a new email type should be sent to all List.jsonData.user.
 */
export async function sendManualActionNotificationToPost(listId: number, trigger: NotificationTrigger) {
  const list = await prisma.list.findFirst({
    where: {
      id: listId,
    },
    include: {
      country: true,
    },
  });

  logger.error(
    `sendManualActionNotificationToPost: List with id ${listId} could not be found, could not send notification for NotificationTrigger ${trigger}`
  );
  if (!list) {
    return { error: `invalid ${listId}` };
  }

  const notificationTypeToTemplateId: Record<NotificationTrigger, string> = {
    PROVIDER_SUBMITTED: NOTIFY.templates.newListItemSubmitted,
    CHANGED_DETAILS: NOTIFY.templates.editProviderDetails,
    UNPUBLISHED: NOTIFY.templates.listItemUnpublished,
  };

  const templateId = notificationTypeToTemplateId[trigger];

  if (!templateId) {
    logger.error(
      `sendManualActionNotificationToPost - Trigger was ${trigger} but the associated email could not be found`
    );
  }

  const { jsonData = {} } = list as List;
  const { users = [] } = jsonData;

  if (users.length === 0) {
    return { error: "No email addresses found" };
  }

  const personalisation = getCommonPersonalisations(list.type, list.country.name);

  return await sendEmails(templateId, users, { personalisation, reference: "" });
}

export async function sendContactUsEmail(personalisation: Record<"emailSubject" | "emailPayload", string>) {
  return await sendEmails(NOTIFY.templates.contactUsApplyJourney, FEEDBACK_EMAIL_ADDRESSES, {
    personalisation,
    reference: "",
  });
}

export async function sendProviderInformedOfEditEmail(
  emailAddress: string,
  personalisation: Record<"contactName" | "typePlural" | "message", string>
) {
  const { typePlural, ...otherValues } = personalisation;
  return await sendEmails(
    NOTIFY.templates.providerInformedOfEdit,
    [emailAddress],
    {
      personalisation: {
        ...otherValues,
        typeSingular: convertPluralToSingular(startCase(typePlural)),
      },
      reference: "",
    },
    "sendProviderInformedOfEditEmail"
  );
}
