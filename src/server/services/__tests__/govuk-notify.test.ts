import { NotifyClient } from "notifications-node-client";
import { sendApplicationConfirmationEmail } from "../govuk-notify";
import { GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID } from "server/config";

describe("GOVUK Notify service:", () => {
  test("notify sendEmail command is correct", async () => {
    const notifyClient = new NotifyClient();
    const emailAddress = "testemail@gov.uk";
    const confirmationLink = "https://localhost/confirm/123Reference";

    const result = await sendApplicationConfirmationEmail(
      emailAddress,
      confirmationLink
    );

    expect(result).toBe(true);
    expect(
      notifyClient.sendEmail
    ).toHaveBeenCalledWith(
      GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
      emailAddress,
      { personalisation: { confirmationLink } }
    );
  });
});
