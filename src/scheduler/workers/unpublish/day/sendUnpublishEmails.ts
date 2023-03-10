import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishProviderConfirmation } from "./sendUnpublishProviderConfirmation";
import { sendUnpublishPostConfirmation } from "./sendUnpublishPostConfirmation";
import { getMetaForList } from "./getMetaForList";
import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../types";
import { ListJsonData } from "server/models/types";

export async function sendUnpublishEmails(list: ListWithCountryName) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendUnpublishEmails", timeframe: "day" });

  const meta = getMetaForList(list);
  if (!meta) {
    return;
  }

  // @ts-ignore
  if (meta.daysUntilUnpublish > 0) {
    logger.info(
      `${meta.daysUntilUnpublish} does not match 0 day before unpublish, skipping sendEmailsToNonRespondents`
    );
    return;
  }

  const listItems = await findNonRespondentsForList(list);

  if (!listItems) {
    return;
  }

  logger.info(`sending provider email for list items ${listItems.map((listItem) => listItem.id)}`);
  // @ts-ignore email provider
  const providerEmailTasks = listItems.map(async (listItem) => await sendUnpublishProviderConfirmation(listItem, meta));
  const emailsForProviders = await Promise.allSettled(providerEmailTasks);
  emailsForProviders
    .filter((result) => result.status !== "fulfilled")
    .forEach((failedResult) => {
      // @ts-ignore
      logger.error(`Failed to send email to provider ${failedResult.reason}`);
    });

  logger.info(
    `Sent ${emailsForProviders.filter((promise) => promise.status === "fulfilled").length} provider emails for list ${
      list.id
    }`
  );

  let emailsSent = emailsForProviders;
  const listJsonData = list.jsonData as ListJsonData;

  // email post
  if (listJsonData.users) {
    const postEmailTasks = listJsonData.users.map(
      async (emailAddress) => await sendUnpublishPostConfirmation(emailAddress, list, listItems.length, meta)
    );
    const emailsForPost = await Promise.allSettled(postEmailTasks);
    emailsSent = emailsSent.concat(emailsForPost);

    emailsForPost
      .filter((result) => result.status !== "fulfilled")
      .forEach((failedResult) => {
        // @ts-ignore
        logger.error(`Failed to send email to post ${failedResult.reason}`);
      });

    logger.info(
      `Sent ${emailsForPost.filter((promise) => promise.status === "fulfilled").length} post emails for list ${list.id}`
    );
  }
  return await Promise.allSettled(emailsSent);
}
