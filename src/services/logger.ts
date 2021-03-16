import winston from "winston";
import { LOG_LEVEL } from "config";

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: "server" },
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level LOG_LEVEL and below to console.log
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.Console({ level: LOG_LEVEL }),
  ],
});
