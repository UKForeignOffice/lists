import dotenv from "dotenv";

dotenv.config();

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

export const isProd = (): boolean => {
  return NODE_ENV === "production";
};

export const isDev = (): boolean => {
  return NODE_ENV === "development";
};

export const isTest = (): boolean => {
  return NODE_ENV === "test";
};

export const isLocal = (): boolean => {
  return process.env.LOCAL_DEV === "true";
};
