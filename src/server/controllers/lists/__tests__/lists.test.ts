import { noop } from "lodash";
import {
  listsDataIngestionController,
  listRedirectToLawyersController,
  listsConfirmApplicationController,
} from "../lists";
import { listItem } from "server/models";
import * as lawyersControllers from "../lawyers";

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
    };
    next = jest.fn();
  });

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
    test("it invokes lawyers lawyersDataIngestionController when serviceType is lawyer", () => {
      req.params.serviceType = "lawyers";

      const spy = jest
        .spyOn(lawyersControllers, "lawyersDataIngestionController")
        .mockImplementation(noop);

      listsDataIngestionController(req, res, next);

      expect(spy).toHaveBeenCalledWith(req, res, next);
    });

    test("it responds with 500 when serviceType is unknown", () => {
      req.params.serviceType = "other";

      listsDataIngestionController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalled();
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
