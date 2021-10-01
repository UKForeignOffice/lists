import IORedis from 'ioredis';
import { logger } from "./logger";
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_TLS,
  isProd,
} from "server/config";

export type TRedisClient = IORedis.Cluster | IORedis.Redis;

let redisClient: TRedisClient | undefined;

export function isRedisAvailable(): boolean {
  return REDIS_HOST !== undefined;
}

/**
 * Redis client
 * 
 * @param cluster - Sets whether to use cluster mode. Defaults to true in production.
 * @param clearClient - Clears the cached Redis client and initiates a new one. Useful for testing and potentially after deployment. Defaults to false.
 */
export function getRedisClient(cluster = isProd, clearClient = false): TRedisClient {
  if (clearClient) {
    redisClient = undefined;
  }

  if (redisClient === undefined) {
    if (cluster) {
      redisClient = new IORedis.Cluster([{
        host: REDIS_HOST,
        port: REDIS_PORT,
      }], {
        dnsLookup: (address, callback) => callback(null, address),
        redisOptions: {
          password: REDIS_PASSWORD,
          tls: REDIS_TLS ? {} : undefined,
        },
      });
    } else {
      redisClient = new IORedis({
        host: REDIS_HOST,
        password: REDIS_PASSWORD,
        port: REDIS_PORT,
        tls: REDIS_TLS ? {} : undefined,
      });
    }

    redisClient.on("error", (error) => {
      logger.error(`Redis Error: ${error.message}`);
    });
  }

  return redisClient;
}
