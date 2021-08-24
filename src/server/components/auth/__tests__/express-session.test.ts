import * as session from "express-session";
import * as connectRedis from "connect-redis";
import { isLocalHost } from "server/config";
import * as redisService from "server/services/redis";
import { configureExpressSession } from "../express-session";

jest.mock("express-session", () => jest.fn());
jest.mock("connect-redis", () => jest.fn());

describe("Express Session", () => {
  let server: any;
  let spySession: jest.SpyInstance;
  let spyGetRedisClient: jest.SpyInstance;
  let spyIsRedisAvailable: jest.SpyInstance;
  let mockRedisStore: any;

  beforeEach(() => {
    server = {
      use: jest.fn(),
    };

    mockRedisStore = jest.fn();
    spySession = jest.spyOn(session, "default");
    spyGetRedisClient = jest.spyOn(redisService, "getRedisClient");
    spyIsRedisAvailable = jest.spyOn(redisService, "isRedisAvailable");
    jest.spyOn(connectRedis, "default").mockReturnValue(mockRedisStore);
  });

  test("session initialization options are correct", async () => {
    await configureExpressSession(server);

    expect(spySession.mock.calls[0][0]).toMatchObject({
      secret: "123ABC",
      saveUninitialized: true,
      resave: false,
      proxy: !isLocalHost,
      cookie: { secure: !isLocalHost },
      name: "lists_sid",
    });
  });

  test("session initialization Redis store is correct", async () => {
    await configureExpressSession(server);

    expect(spyIsRedisAvailable).toHaveBeenCalled();
    expect(spyGetRedisClient).toHaveBeenCalled();
    expect(mockRedisStore).toHaveBeenCalledWith({
      client: redisService.getRedisClient(),
      prefix: "lists_session_",
    });

    expect(spySession.mock.calls[0][0].store instanceof mockRedisStore).toBe(
      true
    );
  });
});
