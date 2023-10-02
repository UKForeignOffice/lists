import * as config from "server/config";
import { logger } from "scheduler/logger";
import { getNotifyClient } from "shared/getNotifyClient";
import type { RemindersBeforeStartDate } from "scheduler/batch/helpers";
import type { SendEmailResponse } from "notifications-node-client";

const { annualReviewNotices } = config.NOTIFY.templates;

export async function sendAnnualReviewProviderEmail(
  emailAddress: string,
  typePlural: string,
  country: string,
  contactName: string,
  deletionDate: string,
  changeLink: string,
  reference = "" // the annual review reference, so we can look up all emails relating to this reference.
): Promise<{ result?: SendEmailResponse | {}; error?: Error }> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
      return { result: { id: "test", template: "test" } };
    }

    const personalisation = {
      contactName,
      typePlural,
      country,
      deletionDate,
      changeLink,
    };
    logger.info(
      `template ${
        annualReviewNotices.providerStart
      }, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(personalisation)}`
    );
    const result = await getNotifyClient().sendEmail(annualReviewNotices.providerStart, emailAddress, {
      personalisation,
      reference,
    });

    return { result };
  } catch (error) {
    const message = `Unable to send annual review provider email: ${error.message}`;
    logger.error(`sendAnnualReviewProviderEmail: ${message}`);
    return { error: new Error(message) };
  }
}

export async function sendAnnualReviewPostEmail(
  reminderType: RemindersBeforeStartDate,
  emailAddress: string,
  typePlural: string,
  country: string,
  annualReviewDate: string,
  reference: string = "" // annual review reference. Allows us to look up emails in notify by group (AR reference)
): Promise<{ result?: SendEmailResponse | {}; error?: Error }> {
  if (config.isSmokeTest) {
    logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
    return { result: { id: "test", template: "test" } };
  }

  const notifyTemplates: Record<RemindersBeforeStartDate, string> = {
    oneMonthBeforeStart: annualReviewNotices.postOneMonth,
    oneWeekBeforeStart: annualReviewNotices.postOneWeek,
    oneDayBeforeStart: annualReviewNotices.postOneDay,
    started: annualReviewNotices.postStart,
  };

  const notifyTemplate = notifyTemplates[reminderType];
  try {
    const personalisation = {
      typePlural,
      country,
      annualReviewDate,
      typePluralCapitalised: typePlural.toUpperCase(),
    };
    logger.info(
      `sendAnnualReviewPostEmail: template - ${reminderType} - ${notifyTemplate}, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(
        personalisation
      )}`
    );
    const result = await getNotifyClient().sendEmail(notifyTemplate, emailAddress, { personalisation, reference });

    return { result };
  } catch (error) {
    const message = `sendAnnualReviewPostEmail: Unable to send annual review post email to ${emailAddress} with template name ${reminderType} id ${notifyTemplate}: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
}
