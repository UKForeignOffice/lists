import IORedis from "ioredis";
import { logger } from "./logger";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_TLS, REDIS_CLUSTER_MODE } from "server/config";

export type RedisClient = IORedis.Cluster | IORedis.Redis;

export type GetRedisClient = () => RedisClient;

let redisClient: RedisClient;

export function isRedisAvailable(): boolean {
  return REDIS_HOST !== undefined;
}

export function getRedisClient(): RedisClient {
  if (redisClient === undefined) {
    if (REDIS_CLUSTER_MODE) {
      redisClient = new IORedis.Cluster(
        [
          {
            host: REDIS_HOST,
            port: REDIS_PORT,
          },
        ],
        {
          dnsLookup: (address, callback) => callback(null, address),
          redisOptions: {
            password: REDIS_PASSWORD,
            tls: REDIS_TLS ? {} : undefined,
          },
        }
      );
    } else {
      redisClient = new IORedis({
        host: REDIS_HOST,
        password: REDIS_PASSWORD,
        port: REDIS_PORT,
        tls: REDIS_TLS ? {} : undefined,
      });
    }

    redisClient.on("error", (error) => {
      logger.error(`getRedisClient: ${error.message}`);
      throw Error("Redis is not configured, exiting");
    });
  }

  return redisClient;
}
