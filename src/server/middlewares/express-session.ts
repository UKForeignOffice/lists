import redis from "redis";
import { Express } from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import { getSecretValue } from "server/services/secrets-manager";
import { isLocalHost, REDIS_HOST, REDIS_PORT } from "server/config";

const ONE_HOUR = 3600000;
const ONE_DAY = 24 * ONE_HOUR;

declare module "express-session" {
  export interface SessionData {
    returnTo?: string;
  }
}

export async function configureExpressSession(server: Express): Promise<void> {
  const secret = await getSecretValue("SESSION_SECRET");

  const options: session.SessionOptions = {
    secret: secret,
    saveUninitialized: true,
    resave: false,
    cookie: {
      secure: !isLocalHost,
      maxAge: isLocalHost ? ONE_DAY : ONE_HOUR,
    },
    name: "lists_sid",
  };

  if (REDIS_HOST !== undefined && REDIS_PORT !== undefined) {
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
