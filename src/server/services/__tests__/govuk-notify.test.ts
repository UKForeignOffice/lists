import { NotifyClient } from "notifications-node-client";
import {
  sendApplicationConfirmationEmail,
  sendAuthenticationEmail,
} from "../govuk-notify";
import {
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
} from "server/config";

describe("GOVUK Notify service:", () => {
  test("sendApplicationConfirmationEmail notify.sendEmail command is correct", async () => {
    const notifyClient = new NotifyClient();
    const contactName = "Ada Lovelace";
    const emailAddress = "testemail@gov.uk";
    const confirmationLink = "https://localhost/confirm/123Reference";

    const result = await sendApplicationConfirmationEmail(
      contactName,
      emailAddress,
      confirmationLink
    );

    expect(result).toBe(true);
    expect(notifyClient.sendEmail).toHaveBeenCalledWith(
      GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
      emailAddress,
      { personalisation: { confirmationLink, contactName } }
    );
  });

  describe("sendAuthenticationEmail", () => {
    test("notify.sendEmail command is correct", async () => {
      const notifyClient = new NotifyClient();
      const emailAddress = "testemail@gov.uk";
      const authenticationLink = "https://localhost/login?token=123Token";

      const result = await sendAuthenticationEmail(
        emailAddress,
        authenticationLink
      );

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
        emailAddress,
        { personalisation: { authenticationLink } }
      );
    });

    test("email won't be sent when email address is not GOV.UK", async () => {
      const notifyClient = new NotifyClient();
      const emailAddress = "testemail@google.com";
      const authenticationLink = "https://localhost/login?token=123Token";

      const result = await sendAuthenticationEmail(
        emailAddress,
        authenticationLink
      );

      expect(result).toBe(false);
      expect(notifyClient.sendEmail).not.toHaveBeenCalled();
    });
  });
});
