import type { NotifyClient } from "notifications-node-client";

export interface NotifyRequestError {
  error: string;
  message: string;
}

export type NotifySendEmailOptions<PersonalisationFields extends Record<string, unknown>> = {
  personalisation: PersonalisationFields;
  reference: string;
  emailReplyToId?: string;
};

type NotifySendEmailData = Awaited<ReturnType<NotifyClient["sendEmail"]>>["data"];

export type NotifyEmailResponse = Pick<NotifySendEmailData, "id"> & {
  template: Pick<NotifySendEmailData["template"], "id">;
};
