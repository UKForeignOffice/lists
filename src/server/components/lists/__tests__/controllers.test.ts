import { listsGetPrivateBetaPage, listsConfirmApplicationController } from "../controllers";
import { ingestPostController } from "../controllers/ingest";
import * as listItem from "server/models/listItem/listItem";
import * as notify from "server/services/govuk-notify";
import { SERVICE_DOMAIN } from "server/config";
import { ServiceType } from "../../../../shared/types";
import * as lawyers from "../searches/lawyers";
import * as notifyEmails from "server/services/govuk-notify";

const webhookPayload = {
  metadata: {
    type: "lawyers",
  },
  questions: [
    {
      question: "Do you speak fluent English?",
      fields: [
        {
          key: "speakEnglish",
          title: "Do you speak English?",
          type: "text",
          answer: true,
        },
      ],
      index: 0,
    },
    {
      question: "Full name",
      fields: [
        {
          key: "contactName",
          type: "text",
          answer: "Winston Smith",
        },
      ],
      index: 0,
    },
    {
      question: "Company name",
      fields: [
        {
          key: "organisationName",
          title: "Organisation name",
          type: "text",
          answer: "Cartesian Systems",
        },
      ],
      index: 0,
    },
    {
      question: "Website address",
      fields: [
        {
          key: "website",
          title: "Website address",
          type: "text",
          answer: "www.com",
        },
      ],
      index: 0,
    },
    {
      question: "Email address",
      fields: [
        {
          key: "emailAddress",
          title: "Email address",
          type: "text",
          answer: "test@fcdo.gov.uk",
        },
      ],
      index: 0,
    },
  ],
};

describe("Lists Controllers", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      params: {
        reference: "123ABC",
      },
      query: {},
      body: {},
    };
    res = {
      render: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      sendStatus: jest.fn(),
      redirect: jest.fn(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  function spyCreateListItem(createdListItem = {}, shouldReject = false): any {
    const spy = jest.spyOn(listItem, "createListItem");

    if (shouldReject) {
      spy.mockRejectedValue(new Error("Ops.. something went wrong"));
    } else {
      spy.mockResolvedValue(createdListItem as any);
    }

    return spy;
  }

  function spySendApplicationConfirmationEmail(): any {
    return jest.spyOn(notify, "sendApplicationConfirmationEmail").mockResolvedValue(true);
  }

  describe("ingestPostController", () => {
    test("it responds with 500 when serviceType is unknown", async () => {
      req.params.serviceType = "other";
      req.body.questions = [{}];

      await ingestPostController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalled();
    });

    test("it responds with 402 when posted data schema is incorrect", async () => {
      req.params.serviceType = "lawyers";

      await ingestPostController(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalled();
    });

    test.todo("createListItem is invoked correctly");

    test("sendApplicationConfirmationEmail is invoked correctly", async () => {
      req.params.serviceType = "lawyers";
      req.body.questions = webhookPayload.questions;

      const createdListItem = {
        address: {
          country: {
            name: "Italy",
          },
        },
        reference: "123ABC",
        type: "lawyers",
        jsonData: {
          contactName: "Test User",
          emailAddress: "test@email.com",
        },
      };

      spyCreateListItem(createdListItem);
      const spy = spySendApplicationConfirmationEmail();

      await ingestPostController(req, res);

      expect(spy).toHaveBeenCalledWith(
        "Test User",
        "test@email.com",
        "lawyers",
        "Italy",
        `https://${SERVICE_DOMAIN}/confirm/123ABC`
      );
    });

    test("it responds with 422 when createListItem fails", async () => {
      req.params.serviceType = "lawyers";
      req.body.questions = webhookPayload.questions;

      const createdListItem: any = {
        reference: "123ABC",
        jsonData: {
          email: "test@email.com",
        },
      };

      spyCreateListItem(createdListItem, true);

      await ingestPostController(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalledWith({
        error: "Unable to process form",
      });
    });
  });

  describe("listsConfirmApplicationController", () => {
    test("listItem.setEmailIsVerified call is correct", async () => {
      const spy = jest.spyOn(listItem, "setEmailIsVerified").mockResolvedValue({
        type: ServiceType.lawyers,
      });

      await listsConfirmApplicationController(req, res, next);

      expect(spy).toHaveBeenCalledWith({
        reference: "123ABC",
      });
    });

    test("it renders the correct view", async () => {
      jest.spyOn(listItem, "setEmailIsVerified").mockResolvedValue({
        type: ServiceType.lawyers,
      });
      jest.spyOn(notifyEmails, "sendManualActionNotificationToPost").mockResolvedValue({});

      await listsConfirmApplicationController(req, res, next);

      expect(res.render).toHaveBeenCalledWith("lists/application-confirmation-page", {
        serviceName: "Find a lawyer abroad",
      });
    });

    test("should return 404 if no item is found", async () => {
      jest.spyOn(listItem, "setEmailIsVerified").mockResolvedValue({});

      await listsConfirmApplicationController(req, res, next);

      expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    test("next is invoked when setEmailIsVerified fails", async () => {
      const error = new Error("Error");

      jest.spyOn(listItem, "setEmailIsVerified").mockRejectedValue(error);

      await listsConfirmApplicationController(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    function spySetEmailIsVerified() {
      return jest.spyOn(listItem, "setEmailIsVerified").mockResolvedValue({ type: "lawyers", listId: 123 });
    }
  });

  describe("listsGetPrivateBetaPage", () => {
    test("it calls next when serviceType query parameter is undefined", () => {
      req.query.serviceType = undefined;

      listsGetPrivateBetaPage(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test("it calls render with the correct template path and parameters", () => {
      req.query.serviceType = "testServiceType";

      listsGetPrivateBetaPage(req, res, next);

      expect(res.render).toHaveBeenCalledWith("lists/private-beta-page", {
        serviceType: "testServiceType",
        ServiceType,
      });
    });
  });
});
