import {
  getLoginController,
  postLoginController,
  getLogoutController,
  authController,
} from "../controllers";
import * as tokenService from "../json-web-token";
import * as notifyService from "server/services/govuk-notify";
import * as userModel from "server/models/user";
import { getServer } from "server/server";
import { assign, noop } from "lodash";
import { logger } from "server/services/logger";
import * as serverConfig from "server/config/server-config";

jest.mock("server/services/logger");

describe("Auth Module", () => {
  let req: any, res: any, next: any;

  beforeAll(async () => {
    await getServer();
  });

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      protocol: "https",
      get: jest.fn().mockReturnValue("localhost"),
      logout: jest.fn(),
      session: {},
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
      .mockResolvedValue("/login?token=123Token");
  }

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

    test("sendAuthenticationEmail is called with correct parameters", (done) => {
      const email = "person@depto.gov.uk";
      const sendEmailSpy = spySendAuthenticationEmail();
      const createAuthTokenSpy = spyCreateAuthenticationPath();
      req.body.emailAddress = email;

      postLoginController(req, res, next);

      setTimeout(() => {
        expect(createAuthTokenSpy).toHaveBeenCalledWith({ email });
        expect(sendEmailSpy).toHaveBeenCalledWith(
          email,
          "https://test-domain/login?token=123Token"
        );
        done();
      });
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

    test("authLink is not logged outside localhost", (done) => {
      req.body.emailAddress = "person@depto.gov.uk";

      spyCreateAuthenticationPath();
      spySendAuthenticationEmail();

      postLoginController(req, res, next);

      setTimeout(() => {
        expect(logger.warn).not.toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith("login", { success: true });
        done();
      });
    });

    test("authLink is logged on localhost", (done) => {
      assign(serverConfig, { isLocalHost: true });
      jest.resetModules();

      req.body.emailAddress = "person@depto.gov.uk";

      spyCreateAuthenticationPath();
      spySendAuthenticationEmail();

      postLoginController(req, res, next);

      setTimeout(() => {
        expect(res.redirect).toHaveBeenCalled();
        assign(serverConfig, { isLocalHost: false });
        jest.resetModules();
        done();
      });
    });
  });

  describe("getLogoutController", () => {
    test("logout is correct", () => {
      expect(req.logout).not.toHaveBeenCalled();

      getLogoutController(req, res);

      expect(req.logout).toHaveBeenCalled();
    });
  });

  describe("authController", () => {
    const email = "person@depto.gov.uk";
    let spyFindUserByEmail: any;
    let spyCreateUser: any;

    beforeEach(() => {
      spyFindUserByEmail = jest
        .spyOn(userModel, "findUserByEmail")
        .mockResolvedValue(undefined);
      spyCreateUser = jest.spyOn(userModel, "createUser").mockResolvedValue({
        email,
        jsonData: {
          roles: [],
        },
      } as any);
    });

    test.skip("authentication is correct", (done) => {
      tokenService
        .createAuthenticationPath({ email })
        .then((authPath) => {
          req.url = `http://localhost${authPath}`;

          authController(req, res, next);

          setTimeout(() => {
            expect(req.logIn.mock.calls[0][0]).toEqual({
              email: "person@depto.gov.uk",
              jsonData: {
                roles: [],
              },
            });

            expect(req.logIn.mock.calls[0][1]).toEqual({
              failureRedirect: "/login?invalidToken=true",
              successReturnToOrRedirect: "/dashboard",
            });

            expect(spyFindUserByEmail).toHaveBeenCalledWith(email);
            expect(spyCreateUser).toHaveBeenCalledWith({
              email,
              jsonData: {
                roles: [],
              },
            });

            done();
          });
        })
        .catch(noop);
    });

    test.skip("authentication redirects to session.returnTo", (done) => {
      tokenService
        .createAuthenticationPath({
          email: "person@depto.gov.uk",
        })
        .then((authPath) => {
          req.url = `http://localhost${authPath}`;
          req.session.returnTo = "/dashboard?something=1";

          authController(req, res, next);

          setTimeout(() => {
            req.logIn.mock.calls[0][2]();
            expect(res.redirect).toHaveBeenCalledWith("/dashboard?something=1");
            done();
          });
        })
        .catch(noop);
    });

    test("authentication fails when token is invalid", async () => {
      const authPath: any = await tokenService.createAuthenticationPath({
        email: "person@depto.gov.uk",
      });

      req.url = `http://localhost${authPath}MAKEINVALID`;

      authController(req, res, next);

      expect(req.logIn).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith("/login?invalidToken=true");
    });
  });
});
