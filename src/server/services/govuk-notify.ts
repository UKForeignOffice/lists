import { NotifyClient } from "notifications-node-client";
import * as config from "server/config";
import { logger } from "./logger";
import {
  isGovUKEmailAddress,
  throwIfConfigVarIsUndefined,
} from "server/utils/validation";

let notifyClient: any;

export function getNotifyClient(): any {
  if (notifyClient === undefined) {
    const requiredTemplateIds = [
      "GOVUK_NOTIFY_API_KEY",
      // "GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID",
      "GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID",
      "GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID",
    ];

    requiredTemplateIds.forEach(throwIfConfigVarIsUndefined);
    notifyClient = new NotifyClient(config.GOVUK_NOTIFY_API_KEY?.trim());
  }

  return notifyClient;
}

export async function sendAuthenticationEmail(
  email: string,
  authenticationLink: string
): Promise<boolean> {
  const emailAddress = email.trim();

  if (!isGovUKEmailAddress(emailAddress)) {
    return false;
  }

  try {
    const result = await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          authenticationLink,
        },
      }
    );

    return result.statusText === "Created";
  } catch (error) {
    logger.error(`sendAuthenticationEmail Error: ${error.message}`);
    return false;
  }
}

export async function sendApplicationConfirmationEmail(
  contactName: string,
  emailAddress: string,
  confirmationLink: string
): Promise<boolean> {
  try {
    const { statusText } = await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          contactName,
          confirmationLink,
        },
      }
    );

    return statusText === "Created";
  } catch (error) {
    logger.error(`sendApplicationConfirmationEmail Error: ${error.message}`);
    return false;
  }
}

export async function sendDataPublishedEmail(
  contactName: string,
  emailAddress: string,
  searchLink: string
): Promise<boolean> {
  try {
    const { statusText } = await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          contactName,
          searchLink,
        },
      }
    );

    return statusText === "Created";
  } catch (error) {
    logger.error(`sendDataPublishedEmail Error: ${error.message}`);
    return false;
  }
}
