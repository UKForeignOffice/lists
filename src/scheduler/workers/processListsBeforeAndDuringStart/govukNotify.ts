import * as config from "server/config";
import { logger } from "scheduler/logger";
import { getNotifyClient } from "shared/getNotifyClient";
import type { MilestoneTillAnnualReview } from "scheduler/batch/helpers";
import type { NotifyResult } from "shared/types";

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
      `template ${
        config.NOTIFY.templates.annualReviewNotices.providerStart
      }, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(personalisation)}`
    );
    await getNotifyClient().sendEmail(config.NOTIFY.templates.annualReviewNotices.providerStart, emailAddress, { personalisation, reference: "" });
  } catch (error) {
    const message = `Unable to send annual review provider email: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
  return { result: true };
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
    POST_ONE_MONTH: config.NOTIFY.templates.annualReviewNotices.postOneMonth,
    POST_ONE_WEEK: config.NOTIFY.templates.annualReviewNotices.postOneWeek,
    POST_ONE_DAY: config.NOTIFY.templates.annualReviewNotices.postOneDay,
    START: config.NOTIFY.templates.annualReviewNotices.postStart,
  };

  const notifyTemplate = notifyTemplates[milestoneTillAnnualReviewStart];
  try {
    const personalisation = {
      typePlural,
      country,
      annualReviewDate,
      typePluralCapitalised: typePlural.toUpperCase(),
    };
    logger.info(
      `template - ${notifyTemplate}, emailAddress - ${emailAddress}, personalisation - ${JSON.stringify(
        personalisation
      )}`
    );
    const result = await getNotifyClient().sendEmail(notifyTemplate, emailAddress, { personalisation, reference: "" });
    return { result: (result as NotifyResult).statusText === "Created" };
  } catch (error) {
    const message = `Unable to send annual review post email: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
}
