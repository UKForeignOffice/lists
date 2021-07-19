import { NotifyClient } from "notifications-node-client";
import {
  getNotifyClient,
  sendApplicationConfirmationEmail,
  sendAuthenticationEmail,
  sendDataPublishedEmail,
} from "../govuk-notify";
import { logger } from "server/services/logger";

const {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID,
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
} = process.env;

const mocks: { [name: string]: undefined | string } = {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID,
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
};

jest.mock("server/config", () => ({
  get GOVUK_NOTIFY_API_KEY() {
    return mocks.GOVUK_NOTIFY_API_KEY;
  },
  get GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID() {
    return mocks.GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID;
  },
  get GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID() {
    return mocks.GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID;
  },
  get GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID() {
    return mocks.GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID;
  },
}));

describe("GOVUK Notify service:", () => {
  describe("getNotifyClient", () => {
    test("it throws when environment variable GOVUK_NOTIFY_API_KEY is missing", () => {
      mocks.GOVUK_NOTIFY_API_KEY = undefined;

      expect(() => getNotifyClient()).toThrowError(
        "Environment variable GOVUK_NOTIFY_API_KEY is missing"
      );

      mocks.GOVUK_NOTIFY_API_KEY = GOVUK_NOTIFY_API_KEY;
    });

    test("it throws when environment variable GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID is missing", () => {
      mocks.GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID = undefined;
      expect(() => getNotifyClient()).toThrowError(
        "Environment variable GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID is missing"
      );
      mocks.GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID =
        GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID;
    });

    test("it throws when environment variable GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID is missing", () => {
      mocks.GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID =
        undefined;

      expect(() => getNotifyClient()).toThrowError(
        "Environment variable GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID is missing"
      );

      mocks.GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID =
        GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID;
    });

    test("it throws when environment variable GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID is missing", () => {
      mocks.GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID = undefined;

      expect(() => getNotifyClient()).toThrowError(
        "Environment variable GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID is missing"
      );

      mocks.GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID =
        GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID;
    });
  });

  describe("sendAuthenticationEmail", () => {
    test("notify.sendEmail command is correct", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

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

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const emailAddress = "testemail@gov.uk";
      const authenticationLink = "https://localhost/login?token=123Token";

      const result = await sendAuthenticationEmail(
        emailAddress,
        authenticationLink
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "sendAuthenticationEmail Error: sendEmail error message"
      );
    });
  });

  describe("sendApplicationConfirmationEmail", () => {
    test("notify.sendEmail command is correct", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

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

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const confirmationLink = "https://localhost/confirm/123Reference";

      const result = await sendApplicationConfirmationEmail(
        contactName,
        emailAddress,
        confirmationLink
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "sendApplicationConfirmationEmail Error: sendEmail error message"
      );
    });
  });

  describe("sendDataPublishedEmail", () => {
    test("notify.sendEmail command is correct", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const searchLink =
        "http://localhost:3000/find?serviceType=covidTestProviders";

      const result = await sendDataPublishedEmail(
        contactName,
        emailAddress,
        searchLink
      );

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID,
        emailAddress,
        { personalisation: { searchLink, contactName } }
      );
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const searchLink =
        "http://localhost:3000/find?serviceType=covidTestProviders";

      const result = await sendDataPublishedEmail(
        contactName,
        emailAddress,
        searchLink
      );

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "sendDataPublishedEmail Error: sendEmail error message"
      );
    });
  });
});
