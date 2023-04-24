import { findListsInAnnualReview } from "../findListsInAnnualReview";
import { findListsToResetAnnualReview } from "./changeState/findListsToResetAnnualReview";
import { main as sendEmails } from "./sendEmails";
import { changeState as unpublishProvidersAndResetList } from "./changeState";

export async function main() {
  const listsInAnnualReview = await findListsInAnnualReview();
  const listsToResetAnnualReview = await findListsToResetAnnualReview();

  const emailTasks = listsInAnnualReview.map(await sendEmails);
  await Promise.allSettled(emailTasks);

  const stateTasks = listsToResetAnnualReview.map(await unpublishProvidersAndResetList);
  await Promise.allSettled(stateTasks);
}
