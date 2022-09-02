import type { Express, NextFunction, Request, Response } from "express";
import request from "supertest";
import type { SuperTest, Test } from "supertest";
import { getServer } from "../../server";
import { accessControl } from "../access-control";

let mockIsTest = true;

jest.mock("server/config", () => ({
  get isTest() {
    return mockIsTest;
  },
  get FORM_RUNNER_URL() {
    return "apply:3001";
  },
}));

describe("access-control", () => {
  describe("handler", () => {
    let req: Request;
    let res: Response;
    let next: NextFunction;

    beforeEach(() => {
      req = {} as unknown as Request;
      res = {
        redirect: jest.fn(),
      } as unknown as Response;
      next = jest.fn();
    });

    it("should call res.redirect with the correct args when an application path matches", () => {
      req.path = "/application/covid-test-providers";

      accessControl(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        "https://www.gov.uk/foreign-travel-advice"
      );
    });

    it("should call res.redirect with the correct args when a service type query param matches", () => {
      req.path = "/find";
      req.query = {
        serviceType: "covidTestProviders",
      };

      accessControl(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith(
        "https://www.gov.uk/foreign-travel-advice"
      );
    });

    it("should pass through when no paths or query params match", () => {
      req.path = "/find";
      req.query = {
        serviceType: "passports",
      };

      accessControl(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe("middleware", () => {
    let server: Express;
    let application: SuperTest<Test>;

    beforeEach(async () => {
      server = await getServer();
      application = request(server);
    });

    it("should pass through in test mode", async () => {
      const { status } = await application.get(
        "/find?serviceType=covid-test-providers"
      );

      expect(status).toEqual(200);
    });

    describe("when not in test mode", () => {
      beforeEach(() => {
        mockIsTest = false;
      });

      it("should redirect to the GOV.uk travel advice page when accessing COVID test provider application page", async () => {
        const { header, status } = await application.get(
          "/application/covid-test-providers/register-to-the-find-a-covid-19-test-provider-abroad-service"
        );

        expect(header.location).toEqual(
          "https://www.gov.uk/foreign-travel-advice"
        );
        expect(status).toEqual(302);
      });

      it("should redirect to the GOV.uk travel advice page when accessing find a COVID test provider page", async () => {
        const { header, status } = await application.get(
          "/find?serviceType=covidTestProviders"
        );

        expect(header.location).toEqual(
          "https://www.gov.uk/foreign-travel-advice"
        );
        expect(status).toEqual(302);
      });
    });
  });
});
