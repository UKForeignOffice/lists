import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishReminder } from "./sendUnpublishReminder";
import { List } from "@prisma/client";
import { getMetaForList } from "./getMetaForList";
import { logger } from "server/services/logger";

export async function sendEmailsToNonRespondents(list: List) {
  const meta = getMetaForList(list);

  if (!meta) {
    throw new Error(`Exiting for list ${list.id}, not enough information to continue`);
  }

  if (meta.weeksUntilUnpublish >= 6) {
    logger.info(`${list.id} has >= 6 weeks until unpublish, skipping sendEmailsToNonRespondents`);
    return;
  }

  const listItems = await findNonRespondentsForList(list);
  const emailsToSend = listItems.map(async (listItem) => await sendUnpublishReminder(listItem, meta));

  return await Promise.allSettled(emailsToSend);
}
