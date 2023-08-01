import * as lawyers from "./../../../../searches/lawyers";
import { get } from "./../../result";
import { HttpException } from "../../../../../../middlewares/error-handlers";

jest.mock("server/models/db/prisma-client");
test("It invokes the correct search method", async () => {
  const req = {
    params: {
      serviceType: "lawyers",
    },
    session: {
      answers: {},
    },
  };

  const res = {
    locals: {},
    render: jest.fn(),
  };

  const spy = jest.spyOn(lawyers, "searchLawyers");
  await get(req, res);

  expect(spy).toHaveBeenCalled();
});

test("it throws when service type is unknown", async () => {
  const req = {
    params: {
      serviceType: "eggs",
    },
    session: {
      answers: {},
    },
  };

  const res = {
    locals: {},
    render: jest.fn(),
  };

  try {
    await get(req, res);
  } catch (e) {
    expect(e).toBeInstanceOf(HttpException);
  }
});
