import dotenv from "dotenv";

dotenv.config();

export const APP_NAME = process.env.APP_NAME ?? "lists";
export const PORT = process.env.PORT ?? 3000;
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "error";
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const LOCAL_DEV = process.env.LOCAL_DEV === "true";
export const DEBUG = process.env.DEBUG === "true";
export const LOCATION_SERVICE_ACCESS_KEY =
  process.env.LOCATION_SERVICE_ACCESS_KEY;
export const LOCATION_SERVICE_SECRET_KEY =
  process.env.LOCATION_SERVICE_SECRET_KEY;
export const LOCATION_SERVICE_INDEX_NAME =
  process.env.LOCATION_SERVICE_INDEX_NAME;

// TODO remove dev defaults
export const GA_TRACKING_ID = process.env.GA_TRACKING_ID ?? "G-QMXES8PQGH";
export const GA_API_SECRET = process.env.GA_API_SECRET ?? "F_jB5X0mT-6jERB9GmAYSg";

export const isProd = NODE_ENV === "production";
export const isDev = NODE_ENV === "development";
export const isTest = NODE_ENV === "test";
export const isLocalHost = process.env.LOCAL_HOST === "true";
