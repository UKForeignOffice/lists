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

export type TGetRedisClient = () => TRedisClient;

let redisClient: TRedisClient | undefined;

export function isRedisAvailable(): boolean {
  return REDIS_HOST !== undefined;
}

export function getRedisClient(): TRedisClient {
  if (redisClient === undefined) {
    if (isProd) {
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
