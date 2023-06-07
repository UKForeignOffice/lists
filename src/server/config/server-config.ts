import dotenv from "dotenv";

dotenv.config();
// Server config
export const PORT = process.env.PORT ?? 3000;
export const DEBUG = process.env.DEBUG === "true";
export const SERVICE_NAME = process.env.SERVICE_NAME;
export const SERVICE_DOMAIN = process.env.SERVICE_DOMAIN ?? "localhost:3000";
export const LOG_LEVEL = process.env.LOG_LEVEL ?? "error";
export const NODE_ENV = process.env.NODE_ENV;

// Helper flags
export const isProd = NODE_ENV === "production";
export const isDev = NODE_ENV === "development";
export const isTest = NODE_ENV === "test";
export const isLocalHost = process.env.LOCAL_HOST === "true" || SERVICE_DOMAIN.includes("localhost");
export const isCybDev = process.env.CYB_DEV === "true" || isDev;
export const isSmokeTest = process.env.CI_SMOKE_TEST === "true";

// AWS
export const AWS_REGION = "eu-west-1";
export const LOCATION_SERVICE_INDEX_NAME =
  process.env.LOCATION_SERVICE_INDEX_NAME ?? "fcdo-professional-service-finder";

// GOVUK Notify
export const NOTIFY = {
  apiKey: process.env.GOVUK_NOTIFY_API_KEY?.trim() ?? "",
  templates: {
    auth: process.env.GOVUK_NOTIFY_AUTHENTICATION_EMAIL_TEMPLATE_ID?.trim() ?? "",
    emailConfirmation: process.env.GOVUK_NOTIFY_PROFESSIONAL_APPLICATION_EMAIL_CONFIRMATION_TEMPLATE_ID?.trim() ?? "",
    published: process.env.GOVUK_NOTIFY_DATA_PUBLISHED_TEMPLATE_ID?.trim() ?? "",
    edit: process.env.GOVUK_NOTIFY_EDIT_DETAILS_TEMPLATE_ID?.trim() ?? "",
    editAnnualReviewDate: process.env.GOVUK_NOTIFY_EDIT_ANNUAL_REVIEW_DATE_TEMPLATE_ID?.trim() ?? "",
    editProviderDetails: process.env.GOVUK_NOTIFY_EDIT_PROVIDER_DETAILS_TEMPLATE_ID?.trim() ?? "",

    annualReviewNotices: {
      postOneMonth: process.env.GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_MONTH_NOTICE?.trim() ?? "",
      postOneWeek: process.env.GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_WEEK_NOTICE?.trim() ?? "",
      postOneDay: process.env.GOVUK_NOTIFY_ANNUAL_REVIEW_POST_ONE_DAY_NOTICE?.trim() ?? "",
      postStart: process.env.GOVUK_NOTIFY_ANNUAL_REVIEW_POST_STARTED?.trim() ?? "",
      providerStart: process.env.GOVUK_NOTIFY_ANNUAL_REVIEW_PROVIDER_STARTED?.trim() ?? "",
      annualReviewCompleted: process.env.GOVUK_NOTIFY_ANNUAL_REVIEW_POST_COMPLETED?.trim() ?? "",
    },
    unpublishNotice: {
      postWeekly: process.env.GOVUK_NOTIFY_UNPUBLISH_POST_WEEKLY_NOTICE?.trim() ?? "",
      postOneDay: process.env.GOVUK_NOTIFY_UNPUBLISH_POST_ONE_DAY_NOTICE?.trim() ?? "",
      postUnpublished: process.env.GOVUK_NOTIFY_UNPUBLISHED_POST_NOTICE?.trim() ?? "",
      providerOneDay: process.env.GOVUK_NOTIFY_UNPUBLISH_PROVIDER_ONE_DAY_NOTICE?.trim() ?? "",
      providerUnpublished: process.env.GOVUK_NOTIFY_UNPUBLISHED_PROVIDER_NOTICE?.trim() ?? "",
    },
  },
};

// Form runner
export const FORM_RUNNER_URL = process.env.FORM_RUNNER_URL ?? "apply:3001";
export const FORM_RUNNER_PUBLIC_URL = `${SERVICE_DOMAIN}/application`;
