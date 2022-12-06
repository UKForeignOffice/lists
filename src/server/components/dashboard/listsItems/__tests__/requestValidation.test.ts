import { requestValidation } from "../requestValidation";
import { HttpException } from "../../../../middlewares/error-handlers";

const next = jest.fn();
let req, res;

beforeEach(() => {
  req = {
    isUnauthenticated: jest.fn().mockReturnValue(false),
  };

  res = {
    json: jest.fn(),
    render: jest.fn(),
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    locals: {
      list: {
        id: 1,
      },
      listItem: {
        id: 100,
        listId: 1,
      },
    },
  };

  next.mockReset();
});

test("redirects if unauthenticated", async () => {
  req.isUnauthenticated.mockReturnValue(true);
  await requestValidation(req, res, next);
  expect(res.redirect).toHaveBeenCalled();
});

test("handles list type and list item type mismatch", async () => {
  res.locals.list.type = "lawyers";
  res.locals.listItem.type = "funeralDirectors";
  await requestValidation(req, res, next);

  expect(next).toHaveBeenCalledWith(
    new HttpException(400, "400", `Trying to edit a list item which is a different service type to list 1`)
  );
});

test("listItem listId must match list.id", async () => {
  res.locals.listItem.listId = 500;
  await requestValidation(req, res, next);
  expect(next).toHaveBeenCalledWith(
    new HttpException(400, "400", `Trying to edit a list item which does not belong to list 1`)
  );
});
