import { HttpException } from "server/middlewares/error-handlers";
import { getStringRouteParam } from "../route-params";

describe("getStringRouteParam", () => {
  test("returns named route parameters as strings", () => {
    expect(getStringRouteParam({ serviceType: "lawyers" }, "serviceType")).toBe("lawyers");
  });

  test.each([
    ["wildcard parameter arrays", { path: ["forms", "start"] }, "path"],
    ["missing parameters", {}, "listId"],
  ])("rejects %s with a bad-request error", (_description, params, name) => {
    expect(() => getStringRouteParam(params, name)).toThrow(
      expect.objectContaining<HttpException>({
        status: 400,
        message: `Route parameter "${name}" must be a single string.`,
      })
    );
  });
});
