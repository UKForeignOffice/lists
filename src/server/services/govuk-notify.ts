import pluralize from "pluralize";
import * as config from "server/config";
import { logger } from "./logger";
import { isGovUKEmailAddress } from "server/utils/validation";
import { NOTIFY } from "server/config";
import { getNotifyClient } from "shared/getNotifyClient";

interface NotifyResult {
  statusText: string;
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
      reference: "",
    });

    return (result as NotifyResult).statusText === "Created";
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
    const result = await getNotifyClient().sendEmail(NOTIFY.templates.emailConfirmation, emailAddress, {
      personalisation: {
        confirmationLink,
        contactName,
        country,
        type,
      },
      reference: "",
    });

    return (result as NotifyResult).statusText === "Created";
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
    const result = await getNotifyClient().sendEmail(NOTIFY.templates.published, emailAddress, {
      personalisation: {
        country,
        contactName,
        searchLink,
        type,
        typePlural,
      },
      reference: "",
    });

    return (result as NotifyResult).statusText === "Created";
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

    const result = await getNotifyClient().sendEmail(NOTIFY.templates.edit, emailAddress, {
      personalisation: {
        typeSingular,
        typePlural,
        contactName,
        message,
        changeLink,
      },
      reference: "",
    });

    return { result: (result as NotifyResult).statusText === "Created" };
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
    await getNotifyClient().sendEmail(NOTIFY.templates.editAnnualReviewDate, options.emailAddress, { personalisation, reference: "", });
  } catch (error) {
    throw new Error(`sendAnnualReviewDateChangeEmail Error: ${(error as Error).message}`);
  }
}

export async function sendAnnualReviewCompletedEmail(
  emailAddress: string,
  typePlural: string,
  country: string
): Promise<void> {
  try {
    if (config.isSmokeTest) {
      logger.info(`isSmokeTest[${config.isSmokeTest}]`);
      return;
    }

    const personalisation = {
      typeSingular: pluralize.singular(typePlural),
      country,
    };
    logger.info(
      `personalisation for sendAnnualReviewCompletedEmail: ${JSON.stringify(personalisation)}, API key ${
        NOTIFY.apiKey
      }, email address ${emailAddress}`
    );
    await getNotifyClient().sendEmail(NOTIFY.templates.annualReviewNotices.annualReviewCompleted, emailAddress, {
      personalisation,
      reference: "",
    });
  } catch (error) {
    logger.error(`The annual review completion email could not be sent due to error: ${(error as Error).message}`);
  }
}
