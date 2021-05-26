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

const notifyClient = new NotifyClient(GOVUK_NOTIFY_API_KEY);

export async function sendApplicationConfirmationEmail(
  emailAddress: string,
  confirmationLink: string
): Promise<boolean> {
  try {
    const { statusText } = await notifyClient.sendEmail(
      GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
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
      GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
      emailAddress,
      {
        personalisation: {
          authenticationLink,
        },
      }
    );

    return result.statusText === "Created";
  } catch (error) {
    logger.error(`sendApplicationConfirmationEmail Error: ${error.message}`, {
      error,
    });
    logger.error(`Notify Key ${GOVUK_NOTIFY_API_KEY?.slice(8)}`);
    return false;
  }
}
