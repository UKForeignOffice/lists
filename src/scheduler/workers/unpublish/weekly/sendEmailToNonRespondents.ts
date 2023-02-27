import { findNonRespondentsForList } from "./findNonRespondentsForList";
import { sendUnpublishReminder } from "./sendUnpublishReminder";
import { List } from "@prisma/client";

export async function sendEmailsToNonRespondents(list: List) {
  const listItems = await findNonRespondentsForList(list);
  // const emailsToSend = listItems.map(async (listItem) => await sendUnpublishReminder(listItem, meta));
}
