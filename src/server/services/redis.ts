import redis, { RedisClient } from "redis";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "server/config";

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
    });
  }

  return redisClient;
}
