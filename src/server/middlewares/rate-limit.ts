import rateLimit from 'express-rate-limit';
import { Express } from "express";
import { RATE_LIMIT_MAX, RATE_LIMITING_ENABLED } from "server/config";
import { rateLimitExceededErrorHandler } from "server/middlewares/error-handlers";

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: RATE_LIMIT_MAX,
  message: "This request could not be processed. Please try again.",
  handler: rateLimitExceededErrorHandler,
});

export const configureRateLimit = (server: Express): void => {
  if (RATE_LIMITING_ENABLED) {
    server.use(limiter);
  }
};
