import {
  listsDataIngestionController,
  listRedirectToLawyersController,
  listsConfirmApplicationController,
} from "../lists";
import { listItem } from "server/models";
import * as notify from "server/services/govuk-notify";
import { SERVICE_DOMAIN } from "server/config";

const webhookPayload = {
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
          key: "firstName",
          title: "First name",
          type: "text",
          answer: "Rene",
        },
        { key: "middleName", title: "Middle name", type: "text" },
        {
          key: "surname",
          title: "Surname",
          type: "text",
          answer: "Descartes",
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
          answer: "test@gov.uk",
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
      redirect: jest.fn(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  function spyCreateListItem(createdListItem = {}): any {
    return jest
      .spyOn(listItem, "createListItem")
      .mockResolvedValue(createdListItem as any);
  }

  function spySendApplicationConfirmationEmail(): any {
    return jest
      .spyOn(notify, "sendApplicationConfirmationEmail")
      .mockResolvedValue(true);
  }

  describe("listRedirectToLawyersController", () => {
    test("redirect is correct", () => {
      req.query.qParam = 1;
      req.body.bParam = 2;

      listRedirectToLawyersController(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        "/find?qParam=1&bParam=2&reference=123ABC&serviceType=lawyers"
      );
    });
  });

  describe("listsDataIngestionController", () => {
    test("it responds with 500 when serviceType is unknown", () => {
      req.params.serviceType = "other";
      req.body.questions = [{}];

      listsDataIngestionController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalled();
    });

    test("it responds with 402 when posted data schema is incorrect", () => {
      req.params.serviceType = "lawyers";

      listsDataIngestionController(req, res);

      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalled();
    });

    test("createListItem is invoked correctly for lawyers", () => {
      const spy = spyCreateListItem();
      spySendApplicationConfirmationEmail();

      req.params.serviceType = "lawyers";
      req.body.questions = webhookPayload.questions;

      listsDataIngestionController(req, res);

      expect(spy).toHaveBeenCalledWith("lawyers", {
        emailAddress: "test@gov.uk",
        firstName: "Rene",
        middleName: undefined,
        organisationName: "Cartesian Systems",
        speakEnglish: true,
        surname: "Descartes",
        website: "www.com",
      });
    });

    test("createListItem is invoked correctly for lawyers", () => {
      const spy = spyCreateListItem();
      spySendApplicationConfirmationEmail();

      req.params.serviceType = "covidTestProvider";
      req.body.questions = webhookPayload.questions;

      listsDataIngestionController(req, res);

      expect(spy).toHaveBeenCalledWith("covidTestProvider", {
        emailAddress: "test@gov.uk",
        firstName: "Rene",
        middleName: undefined,
        organisationName: "Cartesian Systems",
        speakEnglish: true,
        surname: "Descartes",
        website: "www.com",
      });
    });

    test("sendApplicationConfirmationEmail is invoked correctly", (done) => {
      req.params.serviceType = "covidTestProvider";
      req.body.questions = webhookPayload.questions;

      const createdListItem: any = {
        reference: "123ABC",
        jsonData: {
          email: "test@email.com",
        },
      };

      spyCreateListItem(createdListItem);
      const spy = spySendApplicationConfirmationEmail();

      listsDataIngestionController(req, res);

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(
          createdListItem.jsonData.email,
          `https://${SERVICE_DOMAIN}/confirm/${createdListItem.reference}`
        );
        expect(res.json).toHaveBeenCalledWith({});
        done();
      });
    });
  });

  describe("listsConfirmApplicationController", () => {
    test("listItem.setEmailIsVerified call is correct", () => {
      const spy = jest
        .spyOn(listItem, "setEmailIsVerified")
        .mockResolvedValue(true);

      listsConfirmApplicationController(req, res, next);

      expect(spy).toHaveBeenCalledWith({ reference: "123ABC" });
    });

    test("it renders the correct view", (done) => {
      jest.spyOn(listItem, "setEmailIsVerified").mockResolvedValue(true);

      listsConfirmApplicationController(req, res, next);

      setTimeout(() => {
        expect(res.render).toHaveBeenCalledWith(
          "lists/application-confirmation-page.html"
        );
        done();
      });
    });

    test("next is invoked when setEmailIsVerified fails", (done) => {
      const error = new Error("Error");

      jest.spyOn(listItem, "setEmailIsVerified").mockRejectedValue(error);

      listsConfirmApplicationController(req, res, next);

      setTimeout(() => {
        expect(next).toHaveBeenCalledWith(error);
        done();
      });
    });
  });
});
