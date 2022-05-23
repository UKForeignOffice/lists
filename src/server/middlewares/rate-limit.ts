import rateLimit from 'express-rate-limit';
import { Express } from "express";
import { isTest } from "server/config";
import {
  rateLimitExceededErrorHandler
} from "server/middlewares/error-handlers";

const limiter = rateLimit({
  windowMs: 1*60*1000, // 1 minute
  max: (isTest ? 0 : 120),
  message: "This request could not be processed.  Please try again.",
  handler: rateLimitExceededErrorHandler,
});

export const configureRateLimit = (server: Express): void => {
  if (!isTest) {
    server.use(limiter);
  }
};
