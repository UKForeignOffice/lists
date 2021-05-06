import { NotifyClient } from "notifications-node-client";
import {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
} from "server/config";
import { logger } from "./logger";

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
