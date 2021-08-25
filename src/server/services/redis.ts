import redis, { RedisClient } from "redis";
import { logger } from "./logger";
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_TLS,
} from "server/config";

let redisClient: RedisClient;

export function isRedisAvailable(): boolean {
  return REDIS_HOST !== undefined;
}

export function getRedisClient(): RedisClient {
  if (redisClient === undefined) {
    redisClient = redis.createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      tls: REDIS_TLS ? {} : undefined,
    });

    redisClient.on("error", (error) => {
      logger.error(`Redis Error: ${error.message}`);
    });
  }

  return redisClient;
}
