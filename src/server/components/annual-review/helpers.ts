import { findListById } from "server/models/list";
import { sendAnnualReviewCompletedEmail } from "server/services/govuk-notify";
import { lowerCase, startCase } from "lodash";

export async function sendAnnualReviewCompletedEmailForList(listId: number) {
  const list = await findListById(listId);

  if (list?.jsonData?.users) {
    await Promise.all(
      list.jsonData.users.map(async (postEmailAddress: string) => {
        return await sendAnnualReviewCompletedEmail(
          postEmailAddress,
          lowerCase(startCase(list.type)),
          list?.country?.name ?? ""
        );
      })
    );
  }
}
