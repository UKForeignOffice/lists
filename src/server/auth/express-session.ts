import redis from "redis";
import { Express } from "express";
import { random, noop } from "lodash";
import session from "express-session";
import connectRedis from "connect-redis";
import { getSecretValue, rotateSecret } from "server/services/secrets-manager";
import { isLocalHost, REDIS_HOST, REDIS_PORT } from "server/config";
import { logger } from "server/services/logger";

const ONE_MINUTE = 60000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const SECRET_NAME = "SESSION_SECRET";

declare module "express-session" {
  export interface SessionData {
    returnTo?: string;
  }
}

export async function configureExpressSession(server: Express): Promise<void> {
  const secret = await getSecretValue(SECRET_NAME);

  setTimeout(() => {
    rotateSecret(SECRET_NAME).catch(noop);
  }, random(200) * ONE_MINUTE);

  const options: session.SessionOptions = {
    secret: secret,
    saveUninitialized: true,
    resave: false,
    proxy: !isLocalHost,
    cookie: {
      secure: !isLocalHost,
      maxAge: isLocalHost ? ONE_DAY : ONE_HOUR,
    },
    name: "lists_sid",
  };

  if (REDIS_HOST !== undefined && REDIS_PORT !== undefined) {
    logger.info("Configure Express Session will create redis client");
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
    options.store = new RedisStore({
      client: redisClient,
      prefix: "lists_session_",
    });
  }

  server.use(session(options));
}
