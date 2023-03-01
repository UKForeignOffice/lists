declare module "notifications-node-client" {
  declare class NotifyClient {
    constructor(apiKey: string);

    setProxy: (config: ProxyConfig) => void;

    sendEmail: <T>(
      templateId: string,
      emailAddress: string,
      options: SendEmailOptions<T>
    ) => Response<SendEmailResponse>;

    getNotificationById: (notificationId: string) => Response<GetNotificationByIdResponse>;

    getNotifications: (
      templateType?: string,
      status?: Status,
      reference?: string,
      olderThan?: string
    ) => Response<GetNotificationByIdResponse>;

    prepareUpload: (fileData: Buffer, isCsv: boolean) => PreparedUpload;
  }

  interface ProxyConfig {
    host: string;
    port: number;
  }

  interface SendEmailOptions<PersonalisationFields extends { [key: string]: any }> {
    personalisation: PersonalisationFields;
    reference: string;
    emailReplyToId?: string;
  }

  interface SendEmailResponse {
    content: {
      body: string;
      from_email: string;
      subject: string;
    };
    id: string;
    reference?: string;
    scheduled_for?: string;
    template: Template;
    uri: string;
  }

  type Status = "created" | "sending" | "delivered" | "permanent-failure" | "temporary-failure" | "technical-failure";

  interface GetNotificationByIdEmailResponse {
    body: string;
    completed_at: string;
    created_at: string;
    created_by_name: string;
    email_address: string;
    id: string;
    reference?: string;
    sent_at: string;
    status: Status;
    subject: string;
    template: Template;
    type: "email";
  }
  interface GetNotificationByIdSMSResponse {
    body: string;
    completed_at: string;
    created_at: string;
    created_by_name: string;
    email_address: string;
    id: string;
    phone_number: string;
    reference: null;
    sent_at: string;
    status: Status;
    subject: string;
    template: Template;
    type: "sms";
  }

  interface GetNotificationByIdLetterResponse {
    body: string;
    completed_at: string;
    created_at: string;
    created_by_name: string;
    email_address: string;
    id: string;
    line_1: string;
    line_2?: string;
    line_3: string;
    line_4?: string;
    line_5?: string;
    line_6?: string;
    postage?: "first" | "second";
    reference?: string;
    scheduled_for: string;
    sent_at?: string;
    status: Status;
    subject: string;
    template: Template;
    type: "letter";
  }

  type GetNotificationByIdResponse =
    | GetNotificationByIdEmailResponse
    | GetNotificationByIdLetterResponse
    | GetNotificationByIdSMSResponse;

  interface Template {
    id: string;
    uri: string;
    version: number;
  }

  interface GetNotificationsResponse {
    notifications: [GetNotificationByIdResponse];
  }

  export interface PreparedUpload {
    file: string;
    is_csv: boolean;
  }

  type Response<T> = Promise<{ status: number; data: T | { status_code: number; errors: RequestError[] } }>;

  interface RequestError {
    error: string;
    message: string;
  }
}

interface Result<Success, ErrorType extends Error = Error> {
  result?: Success;
  error?: ErrorType;
}
