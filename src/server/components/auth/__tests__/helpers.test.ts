import { ensureAuthenticated, ensureUserIsAdministrator } from "../helpers";
import { HttpException } from "server/middlewares/error-handlers";

describe("Auth Service", () => {
  describe("ensureAuthenticated", () => {
    test("next function is called when user is authenticated", () => {
      const next = jest.fn();
      const res: any = {};
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
      };

      ensureAuthenticated(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test("request is redirected to /login when user is not authenticated", () => {
      const next = jest.fn();
      const res: any = {
        redirect: jest.fn(),
      };
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(false),
        originalUrl: "/originalUrl",
        session: { returnTo: "" },
      };

      ensureAuthenticated(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(req.session.returnTo).toBe(req.originalUrl);
      expect(res.redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("ensureUserIsAdministrator", () => {
    test("next function is called when user is a SuperAdmin", () => {
      const next = jest.fn();
      const res: any = {};
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
        user: {
          get isAdministrator() {
            return true;
          },
        },
      };

      const isAdministratorSpy = jest.spyOn(req.user, "isAdministrator", "get");

      ensureUserIsAdministrator(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(isAdministratorSpy).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test("response is 405 Not allowed when user is not a SuperAdmin", () => {
      const next = jest.fn();
      const err = new HttpException(405, "405", "Not allowed");
      const res: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
        user: {
          isAdministrator: false,
        },
      };

      ensureUserIsAdministrator(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
