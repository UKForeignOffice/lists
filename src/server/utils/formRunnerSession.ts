import { createFormRunnerEditListItemLink, createFormRunnerReturningUserLink } from "server/components/lists/helpers";
import { generateFormRunnerWebhookData, getNewSessionWebhookData } from "server/components/formRunner/helpers";
import { getInitiateFormRunnerSessionToken } from "server/components/dashboard/helpers";
import type { BaseListItemGetObject, List } from "server/models/types";

interface InitaliseFormRunnerInput {
  list: List;
  listItem: BaseListItemGetObject;
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
}: InitaliseFormRunnerInput): Promise<string> {
  const questions = await generateFormRunnerWebhookData(list, listItem, isUnderTest);
  const formRunnerWebhookData = getNewSessionWebhookData(list.type, listItem.id, questions, message, isAnnualReview, listItem.reference);
  const formRunnerNewSessionUrl = createFormRunnerReturningUserLink(list.type, isAnnualReview!);
  const token = await getInitiateFormRunnerSessionToken(formRunnerNewSessionUrl, formRunnerWebhookData);

  return createFormRunnerEditListItemLink(token);
}
