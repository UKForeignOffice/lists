import * as config from "server/config";
import { logger } from "scheduler/logger";
import { getNotifyClient } from "shared/getNotifyClient";
import type { MilestoneTillAnnualReview } from "scheduler/batch/helpers";
import type { SendEmailResponse } from "notifications-node-client";
import type { ListAnnualReviewPostReminderType } from "server/models/types";

const { annualReviewNotices } = config.NOTIFY.templates;

export async function sendAnnualReviewProviderEmail(
  emailAddress: string,
  typePlural: string,
  country: string,
  contactName: string,
  deletionDate: string,
  changeLink: string
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
      reference: "",
    });

    return { result };
  } catch (error) {
    const message = `Unable to send annual review provider email: ${error.message}`;
    logger.error(`sendAnnualReviewProviderEmail: ${message}`);
    return { error: new Error(message) };
  }
}

type RemindersBeforeStartDate = Exclude<ListAnnualReviewPostReminderType, "oneDayBeforeUnpublish">;
export async function sendAnnualReviewPostEmail(
  reminderType: RemindersBeforeStartDate | MilestoneTillAnnualReview,
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

  // TODO:- Migrate all usage of sendAnnualReviewPostEmail using MilestoneTillAnnualReview to ListAnnualReviewPostReminderType.
  /**
   * Maps `ListAnnualReviewPostReminderType` or `MilestoneTillAnnualReview` to the notify template ID.
   */
  const notifyTemplates: Record<RemindersBeforeStartDate | MilestoneTillAnnualReview, string> = {
    oneMonthBeforeStart: annualReviewNotices.postOneMonth,
    oneWeekBeforeStart: annualReviewNotices.postOneWeek,
    oneDayBeforeStart: annualReviewNotices.postOneDay,
    started: annualReviewNotices.postStart,

    POST_ONE_MONTH: annualReviewNotices.postOneMonth,
    POST_ONE_WEEK: annualReviewNotices.postOneWeek,
    POST_ONE_DAY: annualReviewNotices.postOneDay,
    START: annualReviewNotices.postStart,
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
      `template - ${reminderType} - ${notifyTemplate}, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(
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
