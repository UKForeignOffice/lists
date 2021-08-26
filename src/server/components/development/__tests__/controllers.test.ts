import childProcess from "child_process";
import { resetDb, deployDb } from "../controllers";

describe("Development controllers", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      setTimeout: jest.fn(),
      params: {
        reference: "123ABC",
      },
      query: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe("deployDb", () => {
    it("invokes npm run prisma:deploy and responds correctly", () => {
      const spy = jest.spyOn(childProcess, "exec").mockImplementation(jest.fn());

      deployDb(req, res);
      // @ts-expect-error
      spy.mock.calls[0][1]("error", "stdout", "stderr");

      expect(req.setTimeout).toHaveBeenCalledWith(300000);
      expect(spy.mock.calls[0][0]).toEqual("npm run prisma:deploy");
      expect(res.send).toHaveBeenCalledWith({
        error: "error",
        stdout: "stdout",
        stderr: "stderr",
      });
    });
  });


  describe("resetDb", () => {
    it("invokes npm run prisma:reset and responds correctly", () => {
      const spy = jest.spyOn(childProcess, "exec").mockImplementation(jest.fn());

      resetDb(req, res);
      // @ts-expect-error
      spy.mock.calls[0][1]("error", "stdout", "stderr");

      expect(spy.mock.calls[0][0]).toEqual("npm run prisma:reset");
      expect(res.send).toHaveBeenCalledWith({
        error: "error",
        stdout: "stdout",
        stderr: "stderr",
      });
    });
  });
});
