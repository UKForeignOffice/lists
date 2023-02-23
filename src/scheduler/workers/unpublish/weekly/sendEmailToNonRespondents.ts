import { findNonRespondentsForList } from "./unpublish";
import { sendUnpublishReminder } from "./sendUnpublishReminder";

export async function sendEmailsToNonRespondents(list) {
  const { listItems, meta } = await findNonRespondentsForList(list);
  listItems.forEach(async (listItem) => await sendUnpublishReminder(listItem, meta));
}
