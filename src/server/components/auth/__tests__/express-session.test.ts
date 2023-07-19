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

  let mockRedisStore: any;

  beforeEach(() => {
    server = {
      use: jest.fn(),
    };

    mockRedisStore = jest.fn();
    spySession = jest.spyOn(session, "default");

    jest.spyOn(connectRedis, "default").mockReturnValue(mockRedisStore);
  });

  test("session initialization options are correct", async () => {
    await configureExpressSession(server);

    expect(spySession.mock.calls[0][0]).toMatchObject({
      secret: "12345678",
      saveUninitialized: true,
      resave: false,
      proxy: !isLocalHost,
      cookie: { secure: !isLocalHost },
      name: "lists_sid",
    });
  });

  test("session initialization Redis store is correct", async () => {
    (redisService.isRedisAvailable as jest.Mock).mockReturnValueOnce(true);

    await configureExpressSession(server);

    expect(redisService.isRedisAvailable).toHaveBeenCalled();
    expect(redisService.getRedisClient).toHaveBeenCalled();
    expect(mockRedisStore).toHaveBeenCalledWith({
      client: redisService.getRedisClient(),
      prefix: "lists_session_",
    });

    expect(spySession.mock.calls[0][0].store instanceof mockRedisStore).toBe(true);
  });
});
