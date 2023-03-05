import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishProviderConfirmation } from "./sendUnpublishProviderConfirmation";
import { sendUnpublishPostConfirmation } from "./sendUnpublishPostConfirmation";
import { getMetaForList } from "../getMetaForList";
import { schedulerLogger } from "scheduler/logger";
import { ListWithCountryName } from "../types";
import { ListJsonData } from "server/models/types";

export async function sendUnpublishEmails(list: ListWithCountryName) {
  const logger = schedulerLogger.child({ listId: list.id, method: "sendUnpublishEmails" });

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

  // @ts-ignore email provider
  const emailsForProviders = listItems.map(async (listItem) => await sendUnpublishProviderConfirmation(listItem, meta));
  const listJsonData = list.jsonData as ListJsonData;

  // email post
  const emailsForPost = listJsonData?.users?.map(
    async (emailAddress) => await sendUnpublishPostConfirmation(emailAddress, list, listItems.length, meta)
  );

  const emailsSent = await Promise.allSettled([emailsForProviders, emailsForPost]);

  logger.info(
    `Sent ${emailsSent.filter((promise) => promise.status === "fulfilled").length} emails for list ${list.id}`
  );

  return await Promise.allSettled([emailsForProviders, emailsForPost]);
}
