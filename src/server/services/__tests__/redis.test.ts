import redis, { RedisClient } from "redis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "server/config";
import { getRedisClient, isRedisAvailable } from "../redis";

jest.spyOn(redis, "createClient");

let mockRedisHost: string | undefined = "localhost";
jest.mock("server/config", () => ({
  get REDIS_HOST() {
    return mockRedisHost;
  },
}));

describe("Redis Service:", () => {
  describe("createClient", () => {
    test("parameters are correct", () => {
      getRedisClient();

      expect(redis.createClient).toHaveBeenCalledWith({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
      });
    });

    test("exposed redisClient is correct", () => {
      const redisClient = getRedisClient();

      expect(redisClient instanceof RedisClient).toBe(true);
    });
  });

  describe("isRedisAvailable", () => {
    test("returns true when environment provides REDIS_HOST", () => {
      expect(isRedisAvailable()).toBe(true);
    });

    test("returns false when environment does not provide REDIS_HOST", () => {
      mockRedisHost = undefined;
      expect(isRedisAvailable()).toBe(false);
    });
  });
});
