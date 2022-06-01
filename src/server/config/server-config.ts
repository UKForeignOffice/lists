import dotenv from "dotenv";

dotenv.config();

// Server config
export const PORT = process.env.PORT ?? 3000;
export const DEBUG = process.env.DEBUG === "true";
export const SERVICE_NAME = process.env.SERVICE_NAME;
export const SERVICE_DOMAIN = process.env.SERVICE_DOMAIN ?? "localhost:3000";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "error";
export const NODE_ENV = process.env.NODE_ENV ?? "development";

// Helper flags
export const isProd = NODE_ENV === "production";
export const isDev = NODE_ENV === "development";
export const isTest = NODE_ENV === "test";
export const isLocalHost = process.env.LOCAL_HOST === "true";
export const isCybDev = process.env.CYB_DEV === "true" || isDev || isTest;
export const isCISmokeTest = process.env.CI_SMOKE_TEST === "true";

// AWS
export const AWS_REGION = "eu-west-1";
export const LOCATION_SERVICE_INDEX_NAME =
  process.env.LOCATION_SERVICE_INDEX_NAME;

// GOVUK Notify
export const {
  GOVUK_NOTIFY_API_KEY,
  GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID,
  GOVUK_NOTIFY_POST_NEW_PROFESSIONAL_APPLICATION_RECEIVED_TEMPLATE_ID,
  GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID,
  GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID,
  GOVUK_NOTIFY_EDIT_DETAILS_TEMPLATE_ID,
} = process.env;

// Form runner
export const FORM_RUNNER_SAFELIST = process.env.FORM_RUNNER_SAFELIST;
