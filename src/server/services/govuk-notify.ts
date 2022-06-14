import { NotifyClient } from "notifications-node-client";
import pluralize from "pluralize";
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
      "GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID",
      "GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID",
      "GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID",
    ];

    requiredTemplateIds.forEach(throwIfConfigVarIsUndefined);
    if (config.isSmokeTest) {
      return import("./__mocks__/notifications-node-client").then(
        (mocks) => mocks.NotifyClient
      );
    }

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
  type: string,
  country: string,
  confirmationLink: string
): Promise<boolean> {
  try {
    const { statusText } = await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          confirmationLink,
          contactName,
          country,
          type,
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
  typePlural: string,
  country: string,
  searchLink: string
): Promise<boolean> {
  try {
    const type = pluralize.singular(typePlural);
    const { statusText } = await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          country,
          contactName,
          searchLink,
          type,
          typePlural,
        },
      }
    );

    return statusText === "Created";
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
): Promise<void> {
  try {

    if (config.isCybDev || config.isSmokeTest) {
      return;
    }

    const typeSingular = pluralize.singular(typePlural);
    await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_EDIT_DETAILS_TEMPLATE_ID?.trim(),
      emailAddress,
      {
        personalisation: {
          typeSingular,
          typePlural,
          contactName,
          message,
          changeLink,
        },
      }
    );
  } catch (error) {
    throw new Error(`Unable to send change request email: ${error.message}`);
  }
}
