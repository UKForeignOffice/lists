import { ensureAuthenticated } from "../auth";

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
});
