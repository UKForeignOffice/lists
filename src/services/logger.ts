import { createLogger, format, transports } from "winston";
import { Papertrail } from "winston-papertrail";
import { LOG_LEVEL, LOCAL_DEV } from "config";

const transportsList = [
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
];

if (!LOCAL_DEV) {
  transportsList.push(
    new Papertrail({
      host: "logs.papertrailapp.com",
      port: 48692,
    })
  );
}

export const logger = createLogger({
  level: LOG_LEVEL,
  format: format.json(),
  defaultMeta: { service: "server" },
  transports: transportsList,
});
