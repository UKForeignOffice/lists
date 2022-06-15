import IORedis from "ioredis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "server/config";
import { isRedisAvailable, GetRedisClient, RedisClient } from "../redis";

let mockRedisHost: string | undefined = "localhost";
let mockIsClusterMode: boolean = true;

jest.unmock("server/services/redis");

jest.mock("ioredis");

jest.mock("server/config", () => ({
  get REDIS_CLUSTER_MODE() {
    return mockIsClusterMode;
  },
  get REDIS_HOST() {
    return mockRedisHost;
  },
}));

jest.mock("server/services/logger");

describe("Redis Service:", () => {
  describe("getRedisClient", () => {
    let client: RedisClient;
    let getRedisClient: GetRedisClient;

    beforeEach(() => {
      jest.isolateModules(() => {
        ({ getRedisClient } = jest.requireActual("../redis"));
      });
    });

    describe("in cluster mode", () => {
      beforeEach(() => {
        client = getRedisClient();
      });

      test("should initiate Redis in cluster mode", () => {
        expect(IORedis.Cluster).toHaveBeenCalledWith(
          [
            {
              host: REDIS_HOST,
              port: REDIS_PORT,
            },
          ],
          {
            dnsLookup: expect.any(Function),
            redisOptions: {
              password: REDIS_PASSWORD,
            },
          }
        );
      });

      test("should return the correct client type", () => {
        expect(client).toBeInstanceOf(IORedis.Cluster);
      });
    });

    describe("not in cluster mode", () => {
      beforeEach(() => {
        mockIsClusterMode = false;

        client = getRedisClient();
      });

      test("should initiate Redis in normal mode", () => {
        expect(IORedis).toHaveBeenCalledWith({
          host: REDIS_HOST,
          password: REDIS_PASSWORD,
          port: REDIS_PORT,
        });
      });

      test("should return the correct client type", () => {
        expect(client).toBeInstanceOf(IORedis);
      });
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
