import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT ?? 3000;
export const APP_NAME = process.env.APP_NAME ?? "lists";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "error";
export const NODE_ENV = process.env.NODE_ENV ?? "development";
export const DEBUG = process.env.DEBUG === "true";

// Location service
export const LOCATION_SERVICE_ACCESS_KEY =
  process.env.LOCATION_SERVICE_ACCESS_KEY;
export const LOCATION_SERVICE_SECRET_KEY =
  process.env.LOCATION_SERVICE_SECRET_KEY;
export const LOCATION_SERVICE_INDEX_NAME =
  process.env.LOCATION_SERVICE_INDEX_NAME;

// Google Analytics
export const GA_TRACKING_ID = process.env.GA_TRACKING_ID;
export const GA_API_SECRET = process.env.GA_API_SECRET;

// Helper flags
export const isProd = NODE_ENV === "production";
export const isDev = NODE_ENV === "development";
export const isTest = NODE_ENV === "test";
export const isLocalHost = process.env.LOCAL_HOST === "true";
