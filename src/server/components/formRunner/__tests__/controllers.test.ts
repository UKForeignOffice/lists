import type { Express, NextFunction, Request, Response } from "express";
import request from "supertest";
import type { SuperTest, Test } from "supertest";
import { getServer } from "../../../server";
import { statusController } from "../controllers";

describe("Form runner controllers", () => {
  let application: SuperTest<Test>;
  let next: NextFunction;
  let req: Request;
  let res: Response;
  let server: Express;

  beforeEach(async () => {
    server = await getServer();
    application = request(server);
    req = {} as unknown as Request;
    res = {
      render: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  describe("statusController", () => {
    it("should load up the correct view", () => {
      statusController(req, res, next);

      expect(res.render).toHaveBeenCalledWith("application/status");
    });

    it("should output the correct content", async () => {
      const { text } = await application.get("/application/test/status");

      expect(text).toMatchSnapshot();
    });
  });
});
