import { ensureAuthenticated, ensureUserIsAdministrator } from "../helpers";
import { NextFunction } from "express";

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

  describe("ensureUserisAdministrator", () => {
    test("next function is called when user is a SuperAdmin", () => {
      const next = jest.fn();
      const res: any = {};
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
        user: {
          isAdministrator: jest.fn().mockReturnValue(true),
        },
      };

      ensureUserIsAdministrator(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(req.user.isAdministrator).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test("response is 405 Not allowed when user is not a SuperAdmin", () => {
      const next: NextFunction = mockNextFunction(405, "Not allowed");
      const res: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
        user: {
          isAdministrator: jest.fn().mockReturnValue(false),
        },
      };

      ensureUserIsAdministrator(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(req.user.isAdministrator).toHaveBeenCalled();
    });
  });

  function mockNextFunction(expectedStatus: number, expectedMessage: string): NextFunction {
    const next: NextFunction = (err) => {
      expect(err.message).toBe(expectedMessage);
      expect(err.status).toBe(expectedStatus);
    };
    return next;
  }
});
