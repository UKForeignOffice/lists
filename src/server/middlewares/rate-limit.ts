import rateLimit from "express-rate-limit";
import type { Express } from "express";
import { RATE_LIMIT_MAX, RATE_LIMITING_ENABLED } from "server/config";
import { rateLimitExceededErrorHandler } from "server/middlewares/error-handlers";

if (RATE_LIMITING_ENABLED && (!Number.isInteger(RATE_LIMIT_MAX) || RATE_LIMIT_MAX < 0)) {
  throw new Error("RATE_LIMIT_MAX must be a non-negative integer when rate limiting is enabled");
}

const limiter =
  RATE_LIMIT_MAX > 0
    ? rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        limit: RATE_LIMIT_MAX,
        message: "This request could not be processed. Please try again.",
        handler: rateLimitExceededErrorHandler,
      })
    : undefined;

export const configureRateLimit = (server: Express): void => {
  if (RATE_LIMITING_ENABLED && limiter) {
    server.use(limiter);
  }
};
