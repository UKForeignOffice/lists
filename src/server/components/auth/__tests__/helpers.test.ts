import { ensureAuthenticated, ensureUserIsSuperAdmin } from "../helpers";

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

  describe("ensureUserIsSuperAdmin", () => {
    test("next function is called when user is a SuperAdmin", () => {
      const next = jest.fn();
      const res: any = {};
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
        user: {
          isSuperAdmin: jest.fn().mockReturnValue(true),
        },
      };

      ensureUserIsSuperAdmin(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(req.user.isSuperAdmin).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    test("response is 405 Not allowed when user is not a SuperAdmin", () => {
      const next = jest.fn();
      const res: any = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
      const req: any = {
        isAuthenticated: jest.fn().mockReturnValue(true),
        user: {
          isSuperAdmin: jest.fn().mockReturnValue(false),
        },
      };

      ensureUserIsSuperAdmin(req, res, next);

      expect(req.isAuthenticated).toHaveBeenCalled();
      expect(req.user.isSuperAdmin).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.send).toHaveBeenCalledWith("Not allowed");
      expect(next).not.toHaveBeenCalled();
    });
  });
});
