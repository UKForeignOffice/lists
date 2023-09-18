import { findListById } from "server/models/list";
import { sendAnnualReviewCompletedEmail } from "server/services/govuk-notify";
import { lowerCase, startCase } from "lodash";
import type { User } from "@prisma/client";

export async function sendAnnualReviewCompletedEmailForList(listId: number) {
  const list = await findListById(listId);

  if (list?.users) {
    await Promise.all(
      list.users.map(async (user: User) => {
        await sendAnnualReviewCompletedEmail(user.email, lowerCase(startCase(list.type)), list?.country?.name ?? "");
      })
    );
  }
}
