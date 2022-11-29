import { NotifyClient } from "notifications-node-client";
import pluralize from "pluralize";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress, throwIfConfigVarIsUndefined } from "server/utils/validation";
import {
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_DAY_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_MONTH_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_WEEK_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_STARTED,
  GOVUK_NOTIFY_ANNUAL_REVIEW_PROVIDER_STARTED,
  GOVUK_NOTIFY_UNPUBLISH_POST_ONE_DAY_NOTICE,
  GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE,
  GOVUK_NOTIFY_UNPUBLISH_PROVIDER_ONE_DAY_NOTICE,
  GOVUK_NOTIFY_UNPUBLISHED_POST_NOTICE,
  GOVUK_NOTIFY_UNPUBLISHED_PROVIDER_NOTICE,
} from "server/config";

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
      return import("./__mocks__/notifications-node-client").then((mocks) => mocks.NotifyClient);
    }

    notifyClient = new NotifyClient(config.GOVUK_NOTIFY_API_KEY?.trim());
  }

  return notifyClient;
}

export async function sendAuthenticationEmail(email: string, authenticationLink: string): Promise<boolean> {
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
    logger.info(`isSmokeTest[${config.isSmokeTest}]`);
    if (config.isSmokeTest) {
      return;
    }

    const typeSingular = typePlural.split(" ").map((word: string) => {
      return pluralize.singular(word);
    }).join(" ");

    message = message.replace(/(?:\r\n)/g, "\n^");

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
    });
  } catch (error) {
    throw new Error(`Unable to send change request email: ${error.message}`);
  }
}

export async function sendAnnualReviewPostEmail(
  daysBeforeAnnualReviewStart: number,
  emailAddress: string,
  typePlural: string,
  country: string,
  annualReviewDate: string
): Promise<{ result?: boolean, error?: Error }> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
      return { result: true };
    }

    if (emailAddress !== "ali@cautionyourblast.com") {
      emailAddress = "ali@cautionyourblast.com";
    }

    const notifyTemplates: Record<number, string> = {
      28: GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_MONTH_NOTICE ?? "",
      7: GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_WEEK_NOTICE ?? "",
      1: GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_DAY_NOTICE ?? "",
      0: GOVUK_NOTIFY_ANNUAL_REVIEW_POST_STARTED ?? "",
    };

    const notifyTemplate = notifyTemplates[daysBeforeAnnualReviewStart];
    logger.info(
      `personalisation - template ${notifyTemplate}, typePlural: ${typePlural}, country: ${country}, annualReviewDate: ${annualReviewDate}, daysBeforeAnnualReviewStart: ${daysBeforeAnnualReviewStart}`
    );
    await getNotifyClient().sendEmail(
      notifyTemplate,
      emailAddress,
      {
      personalisation: {
        typePlural,
        country,
        annualReviewDate,
        typePluralCapitalised: typePlural.toUpperCase(),
      },
    });
  } catch (error) {
    return { error: new Error(`Unable to send change request email: ${error.message}`) };
  }
  return { result: true };
}

export async function sendAnnualReviewProviderEmail(
  daysBeforeAnnualReviewStart: number,
  emailAddress: string,
  typePlural: string,
  country: string,
  contactName: string,
  deletionDate: string,
  changeLink: string
): Promise<{ result?: boolean, error?: Error }> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
      return { result: true };
    }

    if (emailAddress !== "ali@cautionyourblast.com") {
      emailAddress = "ali@cautionyourblast.com";
    }

    logger.info(
      `personalisation -  contactName:${contactName}, typePlural: ${typePlural}, country: ${country}, deletionDate: ${deletionDate}, changeLink: ${changeLink}`
    );

    await getNotifyClient().sendEmail(
      GOVUK_NOTIFY_ANNUAL_REVIEW_PROVIDER_STARTED,
      emailAddress,
      {
      personalisation: {
        contactName,
        typePlural,
        country,
        deletionDate,
        changeLink,
      },
    });
  } catch (error) {
    return { error: new Error(`Unable to send annual review provider email: ${error.message}`) };
  }
  return { result: true };
}

export async function sendUnpublishedPostEmail(
  daysBeforeUnpublished: number,
  emailAddress: string,
  typePlural: string,
  country: string,
  numberNotResponded: string
): Promise<{ result?: boolean, error?: Error }> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
      return { result: true };
    }
    logger.info(`sending sendUnpublishedPostEmail for ${daysBeforeUnpublished} days before being unpublished
    [typePlural: ${typePlural}, country: ${country}, number not responded: ${numberNotResponded}]`)

    const notifyTemplates: Record<number, string> = {
      35: GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE ?? "",
      28: GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE ?? "",
      21: GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE ?? "",
      14: GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE ?? "",
      7: GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE ?? "",
      1: GOVUK_NOTIFY_UNPUBLISH_POST_ONE_DAY_NOTICE ?? "",
      0: GOVUK_NOTIFY_UNPUBLISHED_POST_NOTICE ?? "",
    };
    await getNotifyClient().sendEmail(
      notifyTemplates[daysBeforeUnpublished],
      emailAddress,
      {
      personalisation: {
        typePluralCapitalised: typePlural.toUpperCase(),
        typePlural,
        country,
        numberNotResponded,
      },
    });
  } catch (error) {
    logger.error(`unable to send post email ${daysBeforeUnpublished} days before unpublishing: ${error.stack}`);
    return { error: Error(`Unable to send change request email: ${error.message}`) };
  }
  return { result: true };
}

export async function sendUnpublishedProviderEmail(
  daysUntilUnpublished: number,
  emailAddress: string,
  typePlural: string,
  country: string,
  contactName: string,
  deletionDate: string,
  changeLink: string
): Promise<{ result?: boolean, error?: Error }> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
      return { result: true };
    }

    if (emailAddress !== "ali@cautionyourblast.com") {
      emailAddress = "ali@cautionyourblast.com";
    }

    logger.info(`sending sendUnpublishedProviderEmail for ${daysUntilUnpublished} days untill unpublished [contactName:${contactName}, typePlural: ${typePlural}, country: ${country}, deletionDate: ${deletionDate}, changeLink: ${changeLink}]`)
    const notifyTemplates: Record<number, string> = {
      1: GOVUK_NOTIFY_UNPUBLISH_PROVIDER_ONE_DAY_NOTICE ?? "",
      0: GOVUK_NOTIFY_UNPUBLISHED_PROVIDER_NOTICE ?? "",
    };
    const basePersonalisation = {
      contactName,
      typePlural,
      country,
      changeLink,
    }
    const personalisation = daysUntilUnpublished === 0
      ? { ...basePersonalisation, deletionDate }
      : basePersonalisation;

    await getNotifyClient().sendEmail(
      notifyTemplates[daysUntilUnpublished],
      emailAddress,
      { personalisation }
    );
    logger.debug(`Sent email to ${emailAddress} with template ${notifyTemplates[daysUntilUnpublished]} for ${daysUntilUnpublished} days before unpublishing`);

  } catch (error) {
    const errorMsg = `Unable to send annual review provider email: ${error.message}`;
    logger.error(errorMsg);
    return { error: new Error(errorMsg) };
  }
  return { result: true };
}
