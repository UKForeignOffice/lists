import { get } from "lodash";
import { NotifyClient } from "notifications-node-client";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress } from "server/utils/validation";

let notifyClient: any;

function throwIfConfigVarIsUndefined(varName: string): void {
  if (get(config, varName) === undefined) {
    throw new Error(`Environment variable ${varName} is missing`);
  }
}

export function getNotifyClient(): any {
  if (notifyClient === undefined) {
    throwIfConfigVarIsUndefined("GOVUK_NOTIFY_API_KEY");
    throwIfConfigVarIsUndefined(
      "GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID"
    );
    throwIfConfigVarIsUndefined(
      "GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID"
    );

    notifyClient = new NotifyClient(config.GOVUK_NOTIFY_API_KEY?.trim());
  }

  return notifyClient;
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
