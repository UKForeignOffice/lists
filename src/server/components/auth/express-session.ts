import type { Express } from "express";
import { random, noop } from "lodash";
import session from "express-session";
import connectRedis from "connect-redis";
import { getSecretValue, rotateSecret } from "server/services/secrets-manager";
import { isLocalHost } from "server/config";
import { logger } from "server/services/logger";
import { getRedisClient, isRedisAvailable } from "server/services/redis";
import type { Action } from "server/components/dashboard/listsItems/item/update/types";
import type { RelatedLink } from "shared/types";

const ONE_MINUTE = 60000;
const ONE_HOUR = 60 * ONE_MINUTE;
const FOUR_HOURS = 4 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;
const SECRET_NAME = "SESSION_SECRET";

interface FuneralDirectorAnswers {
  practiceAreas: string[];
  repatriation: boolean;
  insurance: boolean;
}

export interface TranslatorsInterpretersAnswers {
  languages: string[];
  languagesReadable: string[];
  services: string[];
  interpretationTypes: string[];
  translationTypes: string[];
}

interface LawyersAnswers {
  practiceAreas: string[];
}

interface BaseAnswers {
  country?: string;
  urlSafeCountry?: string;
  serviceType?: "lawyers" | "translators-interpreters" | "funeral-directors";
  region?: string;
  notice?: boolean;
  disclaimer?: boolean;
}

export type Answers = BaseAnswers &
  Partial<FuneralDirectorAnswers> &
  Partial<TranslatorsInterpretersAnswers> &
  Partial<LawyersAnswers>;

declare module "express-session" {
  export interface SessionData {
    returnTo?: string;
    update?: {
      message?: string;
      action?: Action;
    };
    application: {
      type?: "lawyers" | "funeral-directors" | "translators-interpreters";
      country?: string;
      isInitialisedSession?: boolean;
    };
    currentUrl?: string;
    updatesRequired?: boolean;
    currentlyEditing?: number;
    currentlyEditingStartTime?: number;
    relatedLink?: RelatedLink;
    answers: Answers;
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
      maxAge: isLocalHost ? ONE_DAY : FOUR_HOURS,
    },
    name: "lists_sid",
  };

  if (isRedisAvailable()) {
    const redisClient = getRedisClient();
    const RedisStore = connectRedis(session);

    options.store = new RedisStore({
      client: redisClient,
      prefix: "lists_session_",
    });

    logger.info("Redis session storage initialized successfully");
  }

  server.use(session(options));
}
