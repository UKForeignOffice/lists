import type { Redis as Node } from "ioredis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "server/config";
import { getRedisClient, isRedisAvailable } from "../redis";
import { logger } from "server/services/logger";

let mockRedisHost: string | undefined = "localhost";
jest.mock("server/config", () => ({
  get REDIS_HOST() {
    return mockRedisHost;
  },
}));

xdescribe("Redis Service:", () => {
  describe("createClient", () => {
    test("parameters are correct", () => {
      const client = getRedisClient() as Node;
      expect(client.options).toBe({
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD,
        });
    });

    test("exposed redisClient is correct", () => {
      const redisClient = getRedisClient();

      expect(redisClient instanceof Node).toBe(true);
    });

    it("logs redis errors correctly", () => {
      const mockError = new Error("mock error");
      const spyLogger = jest.spyOn(logger, "error");
      const redisClient = getRedisClient();      
      
      redisClient.emit("error", mockError);

      expect(spyLogger).toHaveBeenCalledWith(`Redis Error: ${mockError.message}`);
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
