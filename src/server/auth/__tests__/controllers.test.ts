import {
  getLoginController,
  postLoginController,
  getLogoutController,
  authController,
} from "../controllers";
import * as tokenService from "../json-web-token";
import * as notifyService from "server/services/govuk-notify";

describe("Auth Module", () => {
  let req: any, res: any, next: any;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      protocol: "https",
      get: jest.fn().mockReturnValue("localhost"),
      logout: jest.fn(),
      session: {
        destroy: jest.fn(),
      },
      logIn: jest.fn(),
    };
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("getLoginController", () => {
    test("next function is called when token parameter is present", () => {
      req.query.token = "123abc";
      getLoginController(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.render).not.toHaveBeenCalled();
    });

    test("login view is rendered when token parameter is not present", () => {
      req.query.invalidToken = "true";
      getLoginController(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.render).toHaveBeenCalledWith("login", {
        invalidToken: true,
      });
    });
  });

  describe("postLoginController", () => {
    function spySendAuthenticationEmail(shouldReject?: boolean): any {
      const spy = jest.spyOn(notifyService, "sendAuthenticationEmail");

      if (shouldReject === true) {
        spy.mockRejectedValue("Error");
      } else {
        spy.mockResolvedValue(true);
      }

      return spy;
    }

    function spyCreateAuthenticationPath(): any {
      return jest
        .spyOn(tokenService, "createAuthenticationPath")
        .mockReturnValue("/login?token=123Token");
    }

    test("authentication request is successful when email address is gov.uk", (done) => {
      const emailAddress = "person@depto.gov.uk";
      req.body.emailAddress = emailAddress;

      spySendAuthenticationEmail();
      spyCreateAuthenticationPath();

      postLoginController(req, res, next);

      setTimeout(() => {
        expect(res.render).toHaveBeenCalledWith("login", { success: true });
        done();
      });
    });

    test("sendAuthenticationEmail is called with correct parameters", () => {
      const emailAddress = "person@depto.gov.uk";
      req.body.emailAddress = emailAddress;

      const sendEmailSpy = spySendAuthenticationEmail();
      const createAuthTokenSpy = spyCreateAuthenticationPath();
      postLoginController(req, res, next);

      expect(createAuthTokenSpy).toHaveBeenCalledWith({ emailAddress });
      expect(sendEmailSpy).toHaveBeenCalledWith(
        emailAddress,
        "https://localhost/login?token=123Token"
      );
    });

    test("next function is called when sendAuthenticationEmail rejects", (done) => {
      const emailAddress = "person@depto.gov.uk";
      req.body.emailAddress = emailAddress;

      spySendAuthenticationEmail(true);
      spyCreateAuthenticationPath();
      postLoginController(req, res, next);

      setTimeout(() => {
        expect(next).toHaveBeenCalled();
        expect(res.render).not.toHaveBeenCalled();
        done();
      });
    });

    test("authentication request fails if email address is not gov.uk ", () => {
      req.body.emailAddress = "someemail@gmail.com";
      postLoginController(req, res, next);
      expect(res.render).toHaveBeenCalledWith("login", { error: true });
    });
  });

  describe("getLogoutController", () => {
    test("logout is correct", () => {
      expect(req.logout).not.toHaveBeenCalled();
      expect(req.session.destroy).not.toHaveBeenCalled();

      getLogoutController(req, res);

      expect(req.logout).toHaveBeenCalled();
      expect(req.session.destroy).toHaveBeenCalled();
    });
  });

  describe("authController", () => {
    test("authentication is correct", () => {
      const authPath: any = tokenService.createAuthenticationPath({
        emailAddress: "person@depto.gov.uk",
      });
      req.url = `http://localhost${authPath}`;

      authController(req, res, next);

      expect(req.logIn.mock.calls[0][0]).toEqual({
        emailAddress: "person@depto.gov.uk",
      });
      expect(req.logIn.mock.calls[0][1]).toEqual({
        failureRedirect: "/login?invalidToken=true",
        successReturnToOrRedirect: "/",
      });
    });

    test("authentication redirects to session.returnTo", () => {
      const authPath: any = tokenService.createAuthenticationPath({
        emailAddress: "person@depto.gov.uk",
      });
      req.url = `http://localhost${authPath}`;
      req.session.returnTo = "/dashboard?something=1";

      authController(req, res, next);

      req.logIn.mock.calls[0][2]();
      expect(res.redirect).toHaveBeenCalledWith("/dashboard?something=1");
    });

    test("authentication fails when token is invalid", () => {
      const authPath: any = tokenService.createAuthenticationPath({
        emailAddress: "person@depto.gov.uk",
      });

      req.url = `http://localhost${authPath}MAKEINVALID`;

      authController(req, res, next);

      expect(req.logIn).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/login?invalidToken=true");
    });
  });
});
