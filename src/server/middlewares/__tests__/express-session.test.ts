import * as redis from "redis";
import * as session from "express-session";
import * as connectRedis from "connect-redis";
import { configureExpressSession } from "../express-session";
import { isLocalHost } from "server/config";

jest.mock("redis", () => ({
  createClient: jest.fn(),
}));
jest.mock("express-session", () => jest.fn());
jest.mock("connect-redis", () => jest.fn());

describe("Express Session", () => {
  let server: any;
  let spySession: any;
  let spyRedisCreateClient: any;
  let mockRedisStore: any;

  beforeEach(() => {
    server = {
      use: jest.fn(),
    };

    mockRedisStore = jest.fn();
    spySession = jest.spyOn(session, "default");
    spyRedisCreateClient = jest
      .spyOn(redis, "createClient")
      .mockReturnValue("redis.createClient" as any);
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

    expect(spyRedisCreateClient).toHaveBeenCalledWith({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    expect(mockRedisStore).toHaveBeenCalledWith({
      client: "redis.createClient",
      prefix: "lists_session_",
    });

    expect(spySession.mock.calls[0][0].store instanceof mockRedisStore).toBe(
      true
    );
  });
});
