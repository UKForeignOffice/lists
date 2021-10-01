import IORedis from 'ioredis';
import redis, { RedisClient } from "redis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "server/config";
import { getRedisClient, isRedisAvailable, TRedisClient } from "../redis";
import { logger } from "server/services/logger";

let mockRedisHost: string | undefined = "localhost";

jest.mock("server/config", () => ({
  get REDIS_HOST() {
    return mockRedisHost;
  },
}));

describe("Redis Service:", () => {
  describe.skip("createClient", () => {
    test("parameters are correct", () => {
      jest.spyOn(redis, "createClient");
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

    it("logs redis errors correctly", () => {
      const mockError = new Error("mock error");
      const spyLogger = jest.spyOn(logger, "error");
      const redisClient = getRedisClient();      
      
      redisClient.emit("error", mockError);

      expect(spyLogger).toHaveBeenCalledWith(`Redis Error: ${mockError.message}`);
    });
  });

  describe('getRedisClient', () => {
    let client: TRedisClient;

    describe('in production', () => {
      beforeEach(() => {
        client = getRedisClient(true, true);
      });

      test.todo('should initiate Redis in cluster mode');

      test('should return the correct client type', () => {
        expect(client).toBeInstanceOf(IORedis.Cluster);
      });

      test.todo('should log Redis errors correctly');
    });

    describe('not in production', () => {
      beforeEach(() => {
        client = getRedisClient(false, true);
      });

      test.todo('should initiate Redis in normal mode');

      test('should return the correct client type', () => {
        expect(client).toBeInstanceOf(IORedis);
      });

      test.todo('should log Redis errors correctly');
    });
  })

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
