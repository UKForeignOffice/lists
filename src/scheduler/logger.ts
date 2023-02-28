import { createLogger, format, transports } from "winston";
import { LOG_LEVEL } from "server/config";

const formatters = format.combine(format.timestamp(), format.simple(), format.colorize({ all: true }));

const transportsList = [
  // - Write all logs with level `error` and below to `error.log`
  // - Write all logs with level LOG_LEVEL and below to console.log
  new transports.Console({
    level: LOG_LEVEL,
    format: formatters,
  }),
  new transports.File({ filename: "error.log", level: "error" }),
];

export const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(format.errors({ stack: true }), format.json()),
  defaultMeta: { service: "scheduler" },
  transports: transportsList,
});

export const schedulerLogger = logger;
