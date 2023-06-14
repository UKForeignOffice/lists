import { NotifyClient } from "notifications-node-client";
import { getNotifyClient } from "../../../shared/getNotifyClient";
import {
  sendAnnualReviewPostEmail,
  sendAnnualReviewProviderEmail,
} from "../../../scheduler/workers/processListsBeforeAndDuringStart/govukNotify";
import {
  sendAuthenticationEmail,
  sendApplicationConfirmationEmail,
  sendEditDetailsEmail,
  sendDataPublishedEmail,
  sendManualActionNotificationToPost,
  sendEmails,
} from "../../../server/services/govuk-notify";
import { logger } from "../../../server/services/logger";
import { NOTIFY } from "../../config";
import { prisma } from "../../models/db/__mocks__/prisma-client";
import resetAllMocks = jest.resetAllMocks;
import { getCommonPersonalisations } from "../govuk-notify.helpers";
jest.mock("../../models/db/prisma-client");

const {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID,
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
  GOVUK_NOTIFY_EDIT_DETAILS_TEMPLATE_ID,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_MONTH_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_WEEK_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_DAY_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_STARTED,
  GOVUK_NOTIFY_PROVIDER_EDIT_DETAILS_TEMPLATE_ID,
} = process.env;

const mocks: { [name: string]: undefined | string } = {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID,
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
  GOVUK_NOTIFY_EDIT_DETAILS_TEMPLATE_ID,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_MONTH_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_WEEK_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_DAY_NOTICE,
  GOVUK_NOTIFY_ANNUAL_REVIEW_POST_STARTED,
  GOVUK_NOTIFY_PROVIDER_EDIT_DETAILS_TEMPLATE_ID,
};

const mockNotify = NOTIFY;

describe("GOVUK Notify service:", () => {
  describe("getNotifyClient", () => {
    test("it throws when Server config variable NOTIFY.apiKey is missing", () => {
      mockNotify.apiKey = "";

      expect(() => getNotifyClient()).toThrowError("Server config variable NOTIFY.apiKey is missing");

      mockNotify.apiKey = mocks.GOVUK_NOTIFY_API_KEY ?? "";
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

      const result = await sendAuthenticationEmail(emailAddress, authenticationLink);

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(NOTIFY.templates.auth, emailAddress, {
        personalisation: { authenticationLink },
        reference: "",
      });
    });

    test("email won't be sent when email address is not GOV.UK", async () => {
      const notifyClient = new NotifyClient();
      const emailAddress = "testemail@google.com";
      const authenticationLink = "https://localhost/login?token=123Token";

      const result = await sendAuthenticationEmail(emailAddress, authenticationLink);

      expect(result).toBe(false);
      expect(notifyClient.sendEmail).not.toHaveBeenCalled();
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const emailAddress = "testemail@gov.uk";
      const authenticationLink = "https://localhost/login?token=123Token";

      const result = await sendAuthenticationEmail(emailAddress, authenticationLink);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("sendAuthenticationEmail Error: sendEmail error message");
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
      const country = "Italy";
      const type = "lawyers";

      const result = await sendApplicationConfirmationEmail(contactName, emailAddress, type, country, confirmationLink);

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(NOTIFY.templates.emailConfirmation, emailAddress, {
        personalisation: {
          confirmationLink,
          contactName,
          country,
          type,
        },
        reference: "",
      });
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const confirmationLink = "https://localhost/confirm/123Reference";
      const country = "Italy";
      const type = "lawyers";

      const result = await sendApplicationConfirmationEmail(contactName, emailAddress, type, country, confirmationLink);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("sendApplicationConfirmationEmail Error: sendEmail error message");
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
      const type = "COVID-19 test providers";
      const country = "Germany";
      const searchLink = "http://localhost:3000/find?serviceType=covidTestProviders";

      const result = await sendDataPublishedEmail(contactName, emailAddress, type, country, searchLink);

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(NOTIFY.templates.published, "testemail@gov.uk", {
        personalisation: {
          contactName: "Ada Lovelace",
          country: "Germany",
          searchLink: "http://localhost:3000/find?serviceType=covidTestProviders",
          type: "COVID-19 test provider",
          typePlural: "COVID-19 test providers",
        },
        reference: "",
      });
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const type = "lawyers";
      const country = "Germany";
      const searchLink = "http://localhost:3000/find?serviceType=lawyers";

      const result = await sendDataPublishedEmail(contactName, emailAddress, type, country, searchLink);

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("sendDataPublishedEmail Error: sendEmail error message");
    });
  });

  describe("sendRequestEditsEmail", () => {
    test("notify.sendEmail command is correct", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const message = "Please correct the address";
      const changeLink = "http://localhost:3001/session/TOKEN-ABC123";

      const { result } = await sendEditDetailsEmail(contactName, emailAddress, typePlural, message, changeLink);

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(NOTIFY.templates.edit, "testemail@gov.uk", {
        personalisation: {
          typeSingular: "Lawyer",
          typePlural,
          contactName,
          message,
          changeLink,
        },
        reference: "",
      });
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const contactName = "Ada Lovelace";
      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const message = "Please correct the address";
      const changeLink = "http://localhost:3001/session/TOKEN-ABC123";

      const result = await sendEditDetailsEmail(contactName, emailAddress, typePlural, message, changeLink);

      expect(result.error?.message).toBe("Unable to send change request email: sendEmail error message");
      expect(logger.error).toHaveBeenCalledWith("Unable to send change request email: sendEmail error message");
    });
  });

  describe("sendAnnualReviewPostEmail", () => {
    test("notify.sendEmail command is correct for POST_ONE_MONTH milestone", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const annualReviewDate = "01-Jan-2023";

      const { result } = await sendAnnualReviewPostEmail(
        "POST_ONE_MONTH",
        emailAddress,
        typePlural,
        country,
        annualReviewDate
      );

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        mockNotify.templates.annualReviewNotices.postOneMonth,
        "testemail@gov.uk",
        {
          personalisation: {
            typePlural,
            country,
            annualReviewDate,
            typePluralCapitalised: typePlural.toUpperCase(),
          },
          reference: "",
        }
      );
    });

    test("notify.sendEmail command is correct for POST_ONE_WEEK milestone", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const annualReviewDate = "01-Jan-2023";

      const { result } = await sendAnnualReviewPostEmail(
        "POST_ONE_WEEK",
        emailAddress,
        typePlural,
        country,
        annualReviewDate
      );

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        mockNotify.templates.annualReviewNotices.postOneWeek,
        "testemail@gov.uk",
        {
          personalisation: {
            typePlural,
            country,
            annualReviewDate,
            typePluralCapitalised: typePlural.toUpperCase(),
          },
          reference: "",
        }
      );
    });

    test("notify.sendEmail command is correct for POST_ONE_DAY milestone", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const annualReviewDate = "01-Jan-2023";

      const { result } = await sendAnnualReviewPostEmail(
        "POST_ONE_DAY",
        emailAddress,
        typePlural,
        country,
        annualReviewDate
      );

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        mockNotify.templates.annualReviewNotices.postOneDay,
        "testemail@gov.uk",
        {
          personalisation: {
            typePlural,
            country,
            annualReviewDate,
            typePluralCapitalised: typePlural.toUpperCase(),
          },
          reference: "",
        }
      );
    });

    test("notify.sendEmail command is correct for START milestone", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const annualReviewDate = "01-Jan-2023";

      const { result } = await sendAnnualReviewPostEmail("START", emailAddress, typePlural, country, annualReviewDate);

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        mockNotify.templates.annualReviewNotices.postStart,
        "testemail@gov.uk",
        {
          personalisation: {
            typePlural,
            country,
            annualReviewDate,
            typePluralCapitalised: typePlural.toUpperCase(),
          },
          reference: "",
        }
      );
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const annualReviewDate = "01-Jan-2023";

      const result = await sendAnnualReviewPostEmail(
        "POST_ONE_MONTH",
        emailAddress,
        typePlural,
        country,
        annualReviewDate
      );

      expect(result.error?.message).toBe("Unable to send annual review post email: sendEmail error message");
    });
  });

  describe("sendAnnualReviewProviderEmail", () => {
    test("notify.sendEmail command is correct for START milestone", async () => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const contactName = "Ada Lovelace";
      const deletionDate = "01-Mar-2023";
      const changeLink = "http://localhost:3000/annualReview/check/TOKENABC123";

      const { result } = await sendAnnualReviewProviderEmail(
        emailAddress,
        typePlural,
        country,
        contactName,
        deletionDate,
        changeLink
      );

      expect(result).toBe(true);
      expect(notifyClient.sendEmail).toHaveBeenCalledWith(
        mockNotify.templates.annualReviewNotices.providerStart,
        "testemail@gov.uk",
        {
          personalisation: {
            contactName,
            typePlural,
            country,
            deletionDate,
            changeLink,
          },
          reference: "",
        }
      );
    });

    test("it returns false when sendEmail rejects", async () => {
      const notifyClient = getNotifyClient();
      const error = new Error("sendEmail error message");

      jest.spyOn(notifyClient, "sendEmail").mockRejectedValue(error);

      const emailAddress = "testemail@gov.uk";
      const typePlural = "Lawyers";
      const country = "France";
      const contactName = "Ada Lovelace";
      const deletionDate = "01-Mar-2023";
      const changeLink = "http://localhost:3000/annualReview/check/TOKENABC123";

      const result = await sendAnnualReviewProviderEmail(
        emailAddress,
        typePlural,
        country,
        contactName,
        deletionDate,
        changeLink
      );

      expect(result.error?.message).toBe("Unable to send annual review provider email: sendEmail error message");
    });
  });

  describe("sendManualActionNotificationToPost", () => {
    beforeEach(() => {
      prisma.list.findFirst.mockResolvedValue({
        id: 1,
        type: "lawyers",
        jsonData: {
          users: ["test@gov.uk", "another@gov.uk"],
        },
        country: {
          name: "France",
        },
      });
    });

    afterEach(() => {
      resetAllMocks();
    });

    const triggers = ["PROVIDER_SUBMITTED", "CHANGED_DETAILS", "UNPUBLISHED"];

    test.each(triggers)("notify.sendEmail params are correct when trigger is %p", async (trigger) => {
      const notifyClient = getNotifyClient();

      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce({
        statusText: "Created",
      });

      await sendManualActionNotificationToPost(1, trigger);

      expect(notifyClient.sendEmail).toHaveBeenCalledWith(`${trigger}_TEMPLATE_ID`, "test@gov.uk", {
        personalisation: { typeSingular: "lawyer", type: "lawyers", country: "France" },
        reference: "",
      });
    });

    test("returns resolved value when at least one email succeeds", async () => {
      const notifyClient = getNotifyClient();
      const successfulSend = {
        statusText: "Created",
      };
      const rejectedSend = "Failed to send email";
      jest.spyOn(notifyClient, "sendEmail").mockResolvedValueOnce(successfulSend).mockRejectedValueOnce(rejectedSend);

      const settled = await sendManualActionNotificationToPost(1, "CHANGED_DETAILS");
      expect(settled).toEqual({ statusText: "Created" });
    });
  });
});

describe("sendEmails", () => {
  test("sendEmails calls sendEmail the correct amount of times", async () => {
    const notifyClient = getNotifyClient();
    const spy = jest.spyOn(notifyClient, "sendEmail");

    await sendEmails("abc", ["test@gov.uk", "test@gov.uk"], {});

    expect(spy).toBeCalledTimes(2);
  });

  test("sendEmails only rejects when all emails fail", async () => {
    const notifyClient = getNotifyClient();
    const spy = jest.spyOn(notifyClient, "sendEmail");
    spy.mockRejectedValue("Error");
    await expect(sendEmails("abc", ["test@gov.uk", "test@gov.uk"], {})).rejects.toThrow(AggregateError);
  });

  test("sendEmails returns resolved value when at least one email sends", async () => {
    const notifyClient = getNotifyClient();
    const spy = jest.spyOn(notifyClient, "sendEmail");
    spy.mockResolvedValueOnce({ successText: "woo" }).mockRejectedValue("Error");

    expect(await sendEmails("abc", ["test@gov.uk", "test@gov.uk"], {})).toEqual({ successText: "woo" });
  });
});
