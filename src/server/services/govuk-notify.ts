import { NotifyClient } from "notifications-node-client";
import {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
} from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress } from "server/utils/validation";

if (GOVUK_NOTIFY_API_KEY === undefined) {
  throw new Error("Environment variable GOVUK_NOTIFY_API_KEY is missing");
}

if (
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID ===
  undefined
) {
  throw new Error(
    "Environment variable PROFESSIONAL_APPLICATION_TEMPLATE_ID is missing"
  );
}

if (GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID === undefined) {
  throw new Error("Environment variable AUTHENTICATION_TEMPLATE_ID is missing");
}

const notifyClient = new NotifyClient(GOVUK_NOTIFY_API_KEY.trim());

export async function sendApplicationConfirmationEmail(
  emailAddress: string,
  confirmationLink: string
): Promise<boolean> {
  try {
    const { statusText } = await notifyClient.sendEmail(
      GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
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

export async function sendAuthenticationEmail(
  email: string,
  authenticationLink: string
): Promise<boolean> {
  const emailAddress = email.trim();

  if (!isGovUKEmailAddress(emailAddress)) {
    return false;
  }

  try {
    const result = await notifyClient.sendEmail(
      GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          authenticationLink,
        },
      }
    );

    return result.statusText === "Created";
  } catch (error) {
    logger.error(`sendApplicationConfirmationEmail Error: ${error.message}`);
    return false;
  }
}
