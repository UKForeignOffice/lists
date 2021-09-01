import type { Redis as Node, Cluster } from "ioredis";
import Redis from "ioredis";
import { logger } from "./logger";
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_TLS,
  isDev
} from "server/config";

let redisClient: Node | Cluster;

export function isRedisAvailable(): boolean {
  return REDIS_HOST !== undefined;
}

export function getRedisClient(): Node | Cluster {
  if (redisClient === undefined) {
    redisClient = isDev
      ? new Redis({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD })
      : new Redis.Cluster(
        [
          {
            host: REDIS_HOST,
            port: REDIS_PORT,
          },
        ],
        {
          dnsLookup: (address, callback) => callback(null, address, 4),
          redisOptions: {
            password: REDIS_PASSWORD,
            tls: REDIS_TLS ? {} : undefined
          },
        }
      );

    redisClient.on("error", (error) => {
      logger.error(`Redis Error: ${error.message}`);
    });
  }

  return redisClient;
}
