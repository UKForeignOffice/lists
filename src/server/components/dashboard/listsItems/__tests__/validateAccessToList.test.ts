import { validateAccessToList } from "./../validateAccessToList";
import { HttpException } from "server/middlewares/error-handlers";

const next = jest.fn();
let req, res;

beforeEach(() => {
  req = {
    isUnauthenticated: jest.fn().mockReturnValue(false),
    user: {
      id: 0,
      hasAccessToList: jest.fn(),
    },
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

test("calls next with 403 when user does not have access to list", async () => {
  req.user.hasAccessToList.mockResolvedValue(false);
  await validateAccessToList(req, res, next);
  expect(next).toHaveBeenCalledWith(new HttpException(403, "403", "User is not authorised to access this list."));
});
