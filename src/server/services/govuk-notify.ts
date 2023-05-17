import { NotifyClient } from "notifications-node-client";
import pluralize from "pluralize";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress, throwIfConfigVarIsUndefined } from "server/utils/validation";
import { NOTIFY } from "server/config";
import type { MilestoneTillAnnualReview } from "../../scheduler/batch/helpers";

export function getNotifyClient() {
  // TODO: Use NotifyClient type instead of any
  let notifyClient: any;

  if (notifyClient === undefined) {
    const requiredTemplateIds = ["NOTIFY.apiKey"];

    requiredTemplateIds.forEach(throwIfConfigVarIsUndefined);
    if (config.isSmokeTest) {
      return new FakeNotifyClient();
    }

    notifyClient = new NotifyClient(NOTIFY.apiKey);
  }

  return notifyClient;
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
    });

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
    const { statusText } = await getNotifyClient().sendEmail(NOTIFY.templates.emailConfirmation, emailAddress, {
      personalisation: {
        confirmationLink,
        contactName,
        country,
        type,
      },
    });

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
    const { statusText } = await getNotifyClient().sendEmail(NOTIFY.templates.published, emailAddress, {
      personalisation: {
        country,
        contactName,
        searchLink,
        type,
        typePlural,
      },
    });

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

    const { statusText } = await getNotifyClient().sendEmail(NOTIFY.templates.edit, emailAddress, {
      personalisation: {
        typeSingular,
        typePlural,
        contactName,
        message,
        changeLink,
      },
    });
    return { result: statusText === "Created" };
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
    logger.info(`personalisation for sendAnnualReviewDateChangeEmail: ${JSON.stringify(personalisation)}, API key ${NOTIFY.apiKey}, email address ${options.emailAddress}`);
    await getNotifyClient().sendEmail(NOTIFY.templates.editAnnualReviewDate, options.emailAddress, { personalisation });
  } catch (error) {
    throw new Error(`sendAnnualReviewDateChangeEmail Error: ${(error as Error).message}`);
  }
}

export async function sendAnnualReviewCompletedEmail(
  emailAddress: string,
  typePlural: string,
  country: string): Promise<void> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}]`);
      return;
    }

    const personalisation = {
      typeSingular: pluralize.singular(typePlural),
      country,
    };
    logger.info(`personalisation for sendAnnualReviewCompletedEmail: ${JSON.stringify(personalisation)}, API key ${NOTIFY.apiKey}, email address ${emailAddress}`);
    await getNotifyClient().sendEmail(NOTIFY.templates.annualReviewNotices.annualReviewCompleted, emailAddress, { personalisation });
  } catch (error) {
    logger.error(`The annual review completion email could not be sent due to error: ${(error as Error).message}`);
  }
}

export async function sendAnnualReviewPostEmail(
  milestoneTillAnnualReviewStart: MilestoneTillAnnualReview,
  emailAddress: string,
  typePlural: string,
  country: string,
  annualReviewDate: string
): Promise<{ result?: boolean; error?: Error }> {
  if (config.isSmokeTest) {
    logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
    return { result: true };
  }

  const notifyTemplates: Record<MilestoneTillAnnualReview, string> = {
    POST_ONE_MONTH: NOTIFY.templates.annualReviewNotices.postOneMonth,
    POST_ONE_WEEK: NOTIFY.templates.annualReviewNotices.postOneWeek,
    POST_ONE_DAY: NOTIFY.templates.annualReviewNotices.postOneDay,
    START: NOTIFY.templates.annualReviewNotices.postStart,
  };

  const notifyTemplate = notifyTemplates[milestoneTillAnnualReviewStart];
  try {
    const personalisation = {
      typePlural,
      country,
      annualReviewDate,
      typePluralCapitalised: typePlural.toUpperCase(),
    };
    logger.info(`template - ${notifyTemplate}, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(personalisation)}`);
    const result = await getNotifyClient().sendEmail(notifyTemplate, emailAddress, { personalisation });
    return { result: result.statusText === "Created" };
  } catch (error) {
    const message = `Unable to send annual review post email: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
}

export async function sendAnnualReviewProviderEmail(
  emailAddress: string,
  typePlural: string,
  country: string,
  contactName: string,
  deletionDate: string,
  changeLink: string
): Promise<{ result?: boolean; error?: Error }> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
      return { result: true };
    }

    const personalisation = {
      contactName,
      typePlural,
      country,
      deletionDate,
      changeLink,
    };
    logger.info(
      `template ${NOTIFY.templates.annualReviewNotices.providerStart}, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(personalisation)}`
    );
    await getNotifyClient().sendEmail(NOTIFY.templates.annualReviewNotices.providerStart, emailAddress, { personalisation });
  } catch (error) {
    const message = `Unable to send annual review provider email: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
  return { result: true };
}

class FakeNotifyClient {
  sendEmail() {
    return { statusText: "Created" };
  }
}
