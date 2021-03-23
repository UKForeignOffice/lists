import { createLogger, format, transports } from "winston";
import { LOG_LEVEL } from "config";

export const logger = createLogger({
  level: LOG_LEVEL,
  format: format.json(),
  defaultMeta: { service: "server" },
  transports: [
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level LOG_LEVEL and below to console.log
    new transports.Console({
      level: LOG_LEVEL,
      format: format.combine(
        format.timestamp(),
        format.simple(),
        format.colorize({ all: true })
      ),
    }),
    new transports.File({ filename: "error.log", level: "error" }),
  ],
});
