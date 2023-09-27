import passport from "passport";
import * as passportJwt from "passport-jwt";

import * as jsonWebToken from "../json-web-token";
import AuthenticatedUser from "../authenticated-user";
import * as userModel from "server/models/user";
import { configurePassport } from "../passport";

jest.mock("passport-jwt", () => ({
  Strategy: jest.fn(),
  ExtractJwt: {
    fromUrlQueryParameter: jest.fn().mockReturnValue("fromUrlQueryParameterResult"),
  },
}));

describe("Auth Passport:", () => {
  let server: any;
  let user: any;
  let token: any;

  function spyPassportUse(): jest.SpyInstance {
    return jest.spyOn(passport, "use");
  }

  beforeEach(() => {
    server = {
      use: jest.fn(),
    };

    user = {
      id: 1,
      email: "user@gov.uk",
      jsonData: {
        roles: [],
      },
    };

    token = { user };

    jest.spyOn(passportJwt, "Strategy");
    jest.spyOn(jsonWebToken, "getJwtSecret").mockResolvedValue("123Secret");
  });

  test("passport is configured with JWT strategy", async () => {
    const spyUse = spyPassportUse();

    await configurePassport(server);

    expect(spyUse.mock.calls[0][0]).toBe("jwt");
    expect(spyUse.mock.calls[0][1] instanceof passportJwt.Strategy).toBeTrue();
  });

  test("test JwtStrategy options are correct", async () => {
    const spyJwtStrategy = jest.spyOn(passportJwt, "Strategy");

    await configurePassport(server);

    expect(spyJwtStrategy.mock.calls[0][0]).toEqual({
      secretOrKey: "123Secret",
      algorithms: ["HS256"],
      jwtFromRequest: "fromUrlQueryParameterResult",
    });
    expect(passportJwt.ExtractJwt.fromUrlQueryParameter).toHaveBeenCalledWith("token");
  });

  test("JwtStrategy verify function processes existing user correctly", async () => {
    const spyJwtStrategy = jest.spyOn(passportJwt, "Strategy");
    const spyFindUser = jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(user);

    await configurePassport(server);

    const verifyFunction = spyJwtStrategy.mock.calls[0][1] as any;
    const done = jest.fn();

    await verifyFunction(token, done);

    expect(spyFindUser).toHaveBeenCalledWith(user.email);
    expect(done).toHaveBeenCalledWith(null, user);
  });

  test("JwtStrategy verify function processes invalid authentication token correctly", async () => {
    const spyJwtStrategy = jest.spyOn(passportJwt, "Strategy");

    await configurePassport(server);

    const verifyFunction = spyJwtStrategy.mock.calls[0][1] as any;
    const done = jest.fn();

    await verifyFunction({ user: {} }, done);

    expect(done).toHaveBeenCalledWith(new Error("Invalid authentication token"));
  });

  test("JwtStrategy verify function correctly creates user", async () => {
    jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(undefined);
    const spyJwtStrategy = jest.spyOn(passportJwt, "Strategy");
    const spyCreateUser = jest.spyOn(userModel, "createUser").mockResolvedValueOnce(user);

    await configurePassport(server);

    const verifyFunction = spyJwtStrategy.mock.calls[0][1] as any;
    const done = jest.fn();

    await verifyFunction(token, done);

    expect(spyCreateUser).toHaveBeenCalledWith({
      email: "user@gov.uk",
      jsonData: { roles: [] },
    });
    expect(done).toHaveBeenCalledWith(null, user);
  });

  test("JwtStrategy invokes done with undefined when trying to create a non GOVUK user", async () => {
    jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(undefined);
    const spyJwtStrategy = jest.spyOn(passportJwt, "Strategy");

    await configurePassport(server);

    const verifyFunction = spyJwtStrategy.mock.calls[0][1] as any;
    const done = jest.fn();

    await verifyFunction({ user: { ...user, email: "invalid@email.com" } }, done);

    expect(done).toHaveBeenCalledWith(null, undefined);
  });

  test("serializeUser function works correctly", async () => {
    jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(user);
    const spySerializeUser = jest.spyOn(passport, "serializeUser");

    await configurePassport(server);

    const serializeUser: any = spySerializeUser.mock.calls[0][0];
    const done = jest.fn();

    serializeUser(user, done);

    expect(done).toHaveBeenCalledWith(null, user);
  });

  test("deserializeUser function works correctly", async () => {
    jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(user);
    const spyDeserializeUserUser = jest.spyOn(passport, "deserializeUser");

    await configurePassport(server);

    const deserializeUser: any = spyDeserializeUserUser.mock.calls[0][0];
    const done = jest.fn();

    deserializeUser(user, done);

    expect(done.mock.calls[0][0]).toBe(null);
    expect(done.mock.calls[0][1] instanceof AuthenticatedUser).toBeTrue();
    expect(done.mock.calls[0][1].userData).toEqual(user);
  });

  test("passport is initialized correctly", async () => {
    jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(user);
    const passportInit = jest.fn().mockName("mockPassportInitialize");
    const spyInitialize = jest.spyOn(passport, "initialize").mockReturnValue(passportInit);

    await configurePassport(server);

    expect(spyInitialize).toHaveBeenCalled();
    expect(server.use).toHaveBeenCalledWith(passportInit);
  });

  test("passport session is initialized correctly", async () => {
    jest.spyOn(userModel, "findUserByEmail").mockResolvedValueOnce(user);
    const passportSession = jest.fn();
    const spySession = jest.spyOn(passport, "session").mockReturnValue(passportSession);

    await configurePassport(server);

    expect(spySession).toHaveBeenCalled();
    expect(server.use).toHaveBeenLastCalledWith(passportSession);
  });
});
