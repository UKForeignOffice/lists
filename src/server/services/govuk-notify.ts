import { NotifyClient } from "notifications-node-client";
import pluralize from "pluralize";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress, throwIfConfigVarIsUndefined } from "server/utils/validation";
import { NOTIFY } from "server/config";
import { MilestoneTillAnnualReview } from "../../scheduler/batch/helpers";

let notifyClient: any;

export function getNotifyClient(): any {
  if (notifyClient === undefined) {
    const requiredTemplateIds = [
      NOTIFY.apiKey,
      NOTIFY.templates.published,
      NOTIFY.templates.auth,
      NOTIFY.templates.emailConfirmation,
    ];

    requiredTemplateIds.forEach(throwIfConfigVarIsUndefined);
    if (config.isSmokeTest) {
      return import("./__mocks__/notifications-node-client").then((mocks) => mocks.NotifyClient);
    }

    notifyClient = new NotifyClient(NOTIFY.apiKey);
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
      NOTIFY.templates.auth?.trim(),
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
      NOTIFY.templates.emailConfirmation?.trim(),
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
      NOTIFY.templates.published,
      emailAddress, {
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
): Promise<void> {
  try {
    logger.info(`isSmokeTest[${config.isSmokeTest}]`);
    if (config.isSmokeTest) {
      return;
    }

    const typeSingular = typePlural
      .split(" ")
      .map((word: string) => {
        return pluralize.singular(word);
      })
      .join(" ");

    message = message.replace(/(?:\r\n)/g, "\n^");

    await getNotifyClient().sendEmail(
      NOTIFY.templates.edit,
      emailAddress, {
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

    await getNotifyClient().sendEmail(
      config.GOVUK_NOTIFY_EDIT_ANNUAL_REVIEW_DATE_TEMPLATE_ID?.trim(),
      options.emailAddress,
      {
        personalisation: {
          typePlural: options.serviceType,
          country: options.country,
          annualReviewDate: options.annualReviewDate,
        },
      }
    );
  } catch (error) {
    throw new Error(`sendAnnualReviewDateChangeEmail Error: ${(error as Error).message}`);
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
    POST_ONE_MONTH: NOTIFY.templates.annualReviewNotices.postOneMonth ?? "",
    POST_ONE_WEEK: NOTIFY.templates.annualReviewNotices.postOneWeek ?? "",
    POST_ONE_DAY: NOTIFY.templates.annualReviewNotices.postOneDay ?? "",
    START: NOTIFY.templates.annualReviewNotices.postStart ?? "",
  };

  const notifyTemplate = notifyTemplates[milestoneTillAnnualReviewStart];
  logger.info(
    `personalisation - template ${notifyTemplate}, typePlural: ${typePlural}, country: ${country}, annualReviewDate: ${annualReviewDate}, daysBeforeAnnualReviewStart: ${milestoneTillAnnualReviewStart}`
  );
  try {
    const result = await getNotifyClient().sendEmail(
      notifyTemplate,
      emailAddress, {
        personalisation: {
          typePlural,
          country,
          annualReviewDate,
          typePluralCapitalised: typePlural.toUpperCase(),
        },
      });
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

    logger.info(
      `personalisation - contactName:${contactName}, typePlural: ${typePlural}, country: ${country}, deletionDate: ${deletionDate}, changeLink: ${changeLink}`
    );

    await getNotifyClient().sendEmail(
      NOTIFY.templates.annualReviewNotices.providerStart,
      emailAddress, {
        personalisation: {
          contactName,
          typePlural,
          country,
          deletionDate,
          changeLink,
        },
      });
  } catch (error) {
    const message = `Unable to send annual review provider email: ${error.message}`;
    logger.error(message);
    return { error: new Error(message) };
  }
  return { result: true };
}
// @todo REMOVE COMMENTED CODE ONCE UNPUBLISHED WORKER IMPLEMENTED
// export async function sendUnpublishedPostEmail(
//   daysBeforeUnpublished: number,
//   emailAddress: string,
//   typePlural: string,
//   country: string,
//   numberNotResponded: string
// ): Promise<{ result?: boolean, error?: Error }> {
//   try {
//     if (config.isSmokeTest) {
//       logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
//       return { result: true };
//     }
//     logger.info(`sending sendUnpublishedPostEmail for ${daysBeforeUnpublished} days before being unpublished
//     [typePlural: ${typePlural}, country: ${country}, number not responded: ${numberNotResponded}]`)
//
//     const notifyTemplates: Record<number, string> = {
//       35: NOTIFY.templates.unpublishNotice.postWeekly ?? "",
//       28: NOTIFY.templates.unpublishNotice.postWeekly ?? "",
//       21: NOTIFY.templates.unpublishNotice.postWeekly ?? "",
//       14: NOTIFY.templates.unpublishNotice.postWeekly ?? "",
//       7: NOTIFY.templates.unpublishNotice.postWeekly ?? "",
//       1: NOTIFY.templates.unpublishNotice.postOneDay ?? "",
//       0: NOTIFY.templates.unpublishNotice.postUnpublished ?? "",
//     };
//     await getNotifyClient().sendEmail(
//       notifyTemplates[daysBeforeUnpublished],
//       emailAddress,
//       {
//       personalisation: {
//         typePluralCapitalised: typePlural.toUpperCase(),
//         typePlural,
//         country,
//         numberNotResponded,
//       },
//     });
//   } catch (error) {
//     logger.error(`unable to send post email ${daysBeforeUnpublished} days before unpublishing: ${error.stack}`);
//     return { error: Error(`Unable to send change request email: ${error.message}`) };
//   }
//   return { result: true };
// }
//
// export async function sendUnpublishedProviderEmail(
//   daysUntilUnpublished: number,
//   emailAddress: string,
//   typePlural: string,
//   country: string,
//   contactName: string,
//   deletionDate: string,
//   changeLink: string
// ): Promise<{ result?: boolean, error?: Error }> {
//   try {
//     if (config.isSmokeTest) {
//       logger.info(`isSmokeTest[${config.isSmokeTest}], would be emailing to ${emailAddress}`);
//       return { result: true };
//     }
//
//     logger.info(`sending sendUnpublishedProviderEmail for ${daysUntilUnpublished} days untill unpublished [contactName:${contactName}, typePlural: ${typePlural}, country: ${country}, deletionDate: ${deletionDate}, changeLink: ${changeLink}]`)
//     const notifyTemplates: Record<number, string> = {
//       1: NOTIFY.templates.unpublishNotice.providerOneDay ?? "",
//       0: NOTIFY.templates.unpublishNotice.providerUnpublished ?? "",
//     };
//     const basePersonalisation = {
//       contactName,
//       typePlural,
//       country,
//       changeLink,
//     }
//     const personalisation = daysUntilUnpublished === 0
//       ? { ...basePersonalisation, deletionDate }
//       : basePersonalisation;
//
//     await getNotifyClient().sendEmail(
//       notifyTemplates[daysUntilUnpublished],
//       emailAddress,
//       { personalisation }
//     );
//     logger.debug(`Sent email to ${emailAddress} with template ${notifyTemplates[daysUntilUnpublished]} for ${daysUntilUnpublished} days before unpublishing`);
//
//   } catch (error) {
//     const errorMsg = `Unable to send annual review provider email: ${error.message}`;
//     logger.error(errorMsg);
//     return { error: new Error(errorMsg) };
//   }
//   return { result: true };
// }
