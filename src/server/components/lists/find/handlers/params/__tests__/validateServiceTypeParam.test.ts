import { validateServiceTypeParam } from "../serviceType";
import { HttpException } from "server/middlewares/error-handlers";
import { getServer } from "server/server";
import request from "supertest";

let req, res, next;
beforeEach(() => {
  req = {
    params: {},
  };
  res = {
    locals: {},
  };
  next = jest.fn();
});

describe("validateServiceTypeParam", () => {
  test("Calls NextFunction with 404 if service type is not recognised", () => {
    validateServiceTypeParam(req, res, next, "egg-finder");
    expect(next).toHaveBeenLastCalledWith(new HttpException(404, "404", " "));
  });

  test("Calls NextFunction without parameters if service type is recognised", () => {
    validateServiceTypeParam(req, res, next, "funeral-directors");
    expect(next).toHaveBeenLastCalledWith();

    validateServiceTypeParam(req, res, next, "lawyers");
    expect(next).toHaveBeenLastCalledWith();

    validateServiceTypeParam(req, res, next, "translators-interpreters");
    expect(next).toHaveBeenLastCalledWith();
  });
});

describe("validateServiceType integration", function () {
  let server;

  beforeAll(async () => {
    server = await getServer();
  }, 10000);

  test.each`
    route                                 | expectedStatus
    ${"funeral-directors"}                | ${200}
    ${"funeral-directors/country"}        | ${200}
    ${"lawyers"}                          | ${200}
    ${"lawyers/country"}                  | ${200}
    ${"translators-interpreters"}         | ${200}
    ${"translators-interpreters/country"} | ${200}
    ${"eggs"}                             | ${404}
    ${"eggs/country"}                     | ${404}
    ${"funeralDirectors/country"}         | ${200}
    ${"translatorsInterpreters/country"}  | ${200}
  `(
    "get /find/$route validates :serviceType and returns with status code $status",
    async ({ route, expectedStatus }) => {
      const { status } = await request(server).get(`/find/${route}`);
      expect(status).toBe(expectedStatus);
    }
  );
});
