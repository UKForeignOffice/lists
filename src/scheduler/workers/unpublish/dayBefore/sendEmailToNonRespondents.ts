import { findNonRespondentsForList } from "../findNonRespondentsForList";
import { sendDayBeforeUnpublishProviderReminder } from "./sendDayBeforeUnpublishProviderReminder";
import { sendDayBeforeUnpublishPostReminder } from "./sendDayBeforeUnpublishPostReminder";
import { getMetaForList } from "../getMetaForList";
import { logger } from "scheduler/logger";
import { ListWithCountryName } from "../types";
import { ListJsonData } from "server/models/types";

export async function sendEmailsToNonRespondents(list: ListWithCountryName) {
  const meta = getMetaForList(list);
  if (!meta) {
    throw new Error(`Exiting for list ${list.id}, not enough information to continue`);
  }

  // @ts-ignore
  if (meta?.daysUntilUnpublish !== 1) {
    logger.info(
      `${meta.daysUntilUnpublish} does not match 1 day before unpublish, skipping sendEmailsToNonRespondents`
    );
    return;
  }

  const listItems = await findNonRespondentsForList(list, meta);
  // @ts-ignore
  const emailsToSend = listItems.map(async (listItem) => await sendDayBeforeUnpublishProviderReminder(listItem, meta));
  const listJsonData = list.jsonData as ListJsonData;
  const emailsToSendPost = listJsonData?.users?.map(
    async (emailAddress) => await sendDayBeforeUnpublishPostReminder(emailAddress, list, listItems.length, meta)
  );
  const emailsSent = await Promise.allSettled(emailsToSend);

  if (emailsSent.length) {
    logger.info(
      `Sent ${emailsSent.filter((promise) => promise.status === "fulfilled").length} emails for list ${list.id}`
    );
  }

  return await Promise.allSettled([emailsToSend, emailsToSendPost]);
}
