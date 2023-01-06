import { createFormRunnerEditListItemLink, createFormRunnerReturningUserLink } from "server/components/lists/helpers";
import { generateFormRunnerWebhookData, getNewSessionWebhookData } from "server/components/formRunner/helpers";
import { getInitiateFormRunnerSessionToken } from "server/components/dashboard/helpers";
import type { List, ListItem } from "server/models/types";

interface initialiseFormRunnerInput {
  list: Pick<List, "type"> | Pick<ListItem, "type">;
  listItem: ListItem;
  message: string;
  isUnderTest: boolean;
  isAnnualReview?: boolean;
}

export default async function initialiseFormRunnerSession({
  list,
  listItem,
  message,
  isUnderTest,
  isAnnualReview,
}: initialiseFormRunnerInput): Promise<string> {
  const questions = await generateFormRunnerWebhookData(list, listItem, isUnderTest);
  const formRunnerWebhookData = getNewSessionWebhookData(
    listItem.type,
    listItem.id,
    questions,
    message,
    isAnnualReview,
    listItem.reference
  );
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(listItem.type, isAnnualReview!);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);

  return createFormRunnerEditListItemLink(token);
}
